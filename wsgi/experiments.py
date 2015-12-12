from flask import Blueprint, render_template, request, jsonify, current_app, url_for, redirect
from utils import nocache
from errors import ExperimentError
from models import Participant, Session, Store_user, Category_switch

from sqlalchemy.exc import SQLAlchemyError
from database import db
import re

import datetime
import json

# Status codes
NOT_ACCEPTED = 0
ALLOCATED = 1       # given when the user has entered the instructions phase
STARTED = 2         # given when the user has entered the actual experiment (and at this point the trials need to be recorded )
COMPLETED = 3
QUITEARLY = 6

experiments = Blueprint('experiments', __name__,
                        template_folder='exp/templates', static_folder='exp/static')

experiment_list = [('keep_track', "Keep Track"), ('category_switch', "Category Switch")]

@experiments.route('/', methods=['GET'])         
def index():
    print "------------------------------- inside '/' function in experiments.py-----------------------------------------------"
    """ Serves welcome page, sets up data base, and forwards to experiment if query string parameters are correct"""
    browser = request.user_agent.browser
    version = request.user_agent.version and int(request.user_agent.version.split('.')[0])
    platform = request.user_agent.platform
    uas = request.user_agent.string
    # *************** BROWSER CHECK *********************
    ## Check that the browser is up to date and not mobile
    if (browser == 'msie' and version < 9) \
        or (browser == 'firefox' and version < 4) \
        or (platform == 'android') \
        or (platform == 'iphone') \
        or ((platform == 'macos' or platform == 'windows') and browser == 'safari' and not re.search('Mobile', uas) and version < 534) \
        or (re.search('iPad', uas) and browser == 'safari') \
        or (platform == 'windows' and re.search('Windows Phone OS', uas)) \
        or (browser == 'opera') \
        or (re.search('BlackBerry', uas)):
            return render_template('unsupported.html')
    else:
        ## If the browser is good:
        # *************** Unique Id check *********************        
        if not ('uniqueId' in request.args):
            print "DID NOT GET UNIQUE ID"
            raise ExperimentError('hit_assign_worker_id_not_set_in_exp')
        # *************** Debug CHECK *********************
        if 'debug' in request.args:
            debug = request.args['debug']
        else:
            debug = False
        # *************** new CHECK *********************
        if 'new' in request.args:          #if new is present in query string, 
            new = request.args['new']
            if isinstance(new, str):    #if new is a "string", make it boolean
                new = bool(int())
        else:
            new = True 

        unique_id = request.args['uniqueId']
        current_app.logger.info("Log 001 - Subject: %s started Cognitive Tests" % unique_id)
        return render_template("begin.html", uniqueId=unique_id, experiments=experiment_list, debug=debug, new=new)

@experiments.route('/task', methods=['GET'])
@nocache
def start_exp():
    print "------------------------------- inside '/task' function in experiments.py-----------------------------------------------"
    """ Serves up the experiment applet. """
    unique_id = request.args['uniqueId']
    experiment_name = request.args['experimentName']
    browser = "UNKNOWN" if not request.user_agent.browser else request.user_agent.browser
    platform = "UNKNOWN" if not request.user_agent.platform else request.user_agent.platform
    debug = request.args['debug']
    current_app.logger.info("Log 002 - Subject: %s started task %s in %s platform and %s browser" % (unique_id, experiment_name, platform, browser))

    # Check to see how many records exist for this experiment in Session Table with status >= 1
    ## Status >=1 means: User has already started a session for this experiment, but we dont know what stage of the experiemnt did he leave it in and 
    ## hence we need to dig deeper on that.
    ## Consider -  A user logs has 4 sessions for CS and has left all 4 times in instructions phase ie status=1
    matches = Session.query.filter((Session.gfgid == unique_id) & (Session.exp_name == experiment_name)).all()
    sessions_found = len(matches)
    current_app.logger.info("Log 003 - Sessions found on this experiment: %s", sessions_found)

    ## exps_done=0 means this user has done no experiments before, so allocate status=1 and create a new session for him 
    if sessions_found == 0:
        #Allocate Status of 1
        exp_status = 1
        
        ## Adding data to participant table
        part = Participant(gfgid=unique_id, browser=browser, platform=platform, language="english", experimentname=experiment_name, debug=debug)
        db.session.add(part)
        db.session.commit()
        current_app.logger.info("Log 004 - added it to participant table")

        ## Add gfgid to "store_user table"  
        user_info = Store_user(gfgid=unique_id)
        db.session.add(user_info)
        db.session.commit()
        current_app.logger.info("Log 005 - added it to store_user table")

        ## Add gfgid, browser, platform, debug, status, exp_name to "session table"
        current_time = datetime.datetime.now()
        session_info = Session(gfgid=unique_id, browser=browser, platform=platform, status=exp_status ,debug=debug, exp_name=experiment_name, begin_session=current_time)
        db.session.add(session_info)
        db.session.commit()
        current_app.logger.info("Log 006 - added it to session table")
        sess = Session.query.filter((Session.gfgid == unique_id) & (Session.exp_name == experiment_name) & (Session.begin_session == current_time)).one()
        print "sess is: %s", sess
        print "session id is: %s", sess.session_id
        ## pass the session id also in the URL.
        return render_template(experiment_name + "/exp.html", uniqueId=unique_id, experimentName=experiment_name, debug=debug, sessionid=sess.session_id)
      
    elif sessions_found > 0:
        # They've already done this experiment, we should find out what status they were at and can't do another one if they're past status 1
        ## Option: Re-run the query again on the Session table and pull out those records with status == 3 .. completed
        status_3 = Session.query.filter((Session.gfgid == unique_id) & (Session.exp_name == experiment_name) & (Session.status == 3)).all()
        current_app.logger.info("LOGGER status 3-%s", status_3)
        
        if(len(status_3) == 0):
            ## Pull out those records with status = 6..Quit Early
            status_6 = Session.query.filter((Session.gfgid == unique_id) & (Session.exp_name == experiment_name) & (Session.status == 6)).all()
            current_app.logger.info("LOGGER status 6-%s", status_6)
            if(len(status_6) == 0):
                ## Pull out those records with status = 2
                status_2 = Session.query.filter((Session.gfgid == unique_id) & (Session.exp_name == experiment_name) & (Session.status == 2)).all()
                current_app.logger.info("LOGGER status 2-%s", status_2)
                if(len(status_2 )== 0):
                    ## Pull out those records with status = 1 
                    status_1 = Session.query.filter((Session.gfgid == unique_id) & (Session.exp_name == experiment_name) & (Session.status == 1)).all()
                    if(len(status_1) > 0):
                        current_app.logger.info("Log 007 - User is in Status 1 and can continue experiment in a new session")
                        current_time = datetime.datetime.now()
                        session_info = Session(gfgid=unique_id, browser=browser, platform=platform, status=1 ,debug=debug, exp_name=experiment_name, begin_session=current_time)
                        db.session.add(session_info)
                        db.session.commit()
                        sess = Session.query.filter((Session.gfgid == unique_id) & (Session.exp_name == experiment_name) & (Session.begin_session == current_time)).one()
                        print "sess is: %s", sess
                        print "session id is: %s", sess.session_id
                        ## pass the session id also in the URL.
                        return render_template(experiment_name + "/exp.html", uniqueId=unique_id, experimentName=experiment_name, debug=debug, sessionid=sess.session_id)
                    else:
                        current_app.logger.info("Log 008 - Something is not right in the code")
                        session_info = Session(gfgid=unique_id, browser=browser, platform=platform, status=0 ,debug=debug, exp_name=experiment_name, begin_session=datetime.datetime.now())
                        db.session.add(session_info)
                        db.session.commit()
                        raise ExperimentError('status_incorrectly_set') #this state should not be reached at all. 
                else:
                    current_app.logger.info("Log 009 - User is in Status 2 and cannot re-do this experiment now")
                    session_info = Session(gfgid=unique_id, browser=browser, platform=platform, status=2 ,debug=debug, exp_name=experiment_name, begin_session=datetime.datetime.now())
                    db.session.add(session_info)
                    db.session.commit()
                    raise ExperimentError('already_started_exp')
            else:
                current_app.logger.info("Log 010 - User is in status 6 and cannot re-do this experiment now")
                session_info = Session(gfgid=unique_id, browser=browser, platform=platform, status=6 ,debug=debug, exp_name=experiment_name, begin_session=datetime.datetime.now())
                db.session.add(session_info)
                db.session.commit()
                raise ExperimentError('tried_to_quit')
        else:
            current_app.logger.info("Log 011 - User is in status 3 and has already finished this experiment")
            session_info = Session(gfgid=unique_id, browser=browser, platform=platform, status=3 ,debug=debug, exp_name=experiment_name, begin_session=datetime.datetime.now())
            db.session.add(session_info)
            db.session.commit()
            raise ExperimentError('already_did_exp_hit')
       
# changes status to 2
@experiments.route('/inexp', methods=['POST'])
def enterexp():
    print "------------------------------- inside '/inexp' function in experiments.py-----------------------------------------------"
    """
    AJAX listener that listens for a signal from the user's script when they
    leave the instructions and enter the real experiment. After the server
    receives this signal, it will no longer allow them to re-access the
    experiment applet (meaning they can't do part of the experiment and
    refresh to start over).
    """

    if not ('uniqueId' in request.form) or not ('experimentName' in request.form) or not ('sessionid' in request.form) :
        raise ExperimentError('improper_inputs')

    unique_id = request.form['uniqueId']
    experiment_name = request.form['experimentName']
    session_id = request.form['sessionid']
    
    try:
        user = Participant.query.filter((Participant.gfgid == unique_id) & (Participant.experimentname == experiment_name)).one()
        user.status = 2     # entered the actual experiment phase
        user.beginexp = datetime.datetime.now()
        db.session.add(user)
        db.session.commit()

        # Update the appropriate session with the sessionid
        sess = Session.query.filter((Session.gfgid == unique_id) & (Session.exp_name == experiment_name) & (Session.session_id == session_id)).one()
        print "** sess: %s", sess
        sess.status = 2
        sess.begin_session = datetime.datetime.now()
        db.session.add(sess)
        db.session.commit()
        current_app.logger.info("Log 012 - User has finished the instructions in session id: %s", session_id)
        resp = {"status": "success"}
        #Category_switch should be populated now, ie after status code 2
    except SQLAlchemyError:
        current_app.logger.error("DB error: Unique user and experiment combination not found.")
        resp = {"status": "error, uniqueId and/or experiment not found"}        # it is the dictionary
   
    return jsonify(**resp)

# called to retrieve the JSON object for returning users
@experiments.route('/sync/<id_exp>', methods=['GET'])
def load(id_exp=None):
    print "------------------------------- inside '/sync/<id_exp>' load function in experiments.py-----------------------------------------------"
    """
    Load experiment data, which should be a JSON object and will be storedafter converting to string """
    print "Now we are in the {GET}"
    current_app.logger.info("GET /sync route with id: %s" % id_exp)
    try:
        unique_id, experiment_name, session_id = id_exp.split("&")
        user = Participant.query.filter((Participant.gfgid == unique_id) & (Participant.experimentname == experiment_name)).one()
        sess = Session.query.filter((Session.gfgid == unique_id) & (Session.exp_name == experiment_name) & (Session.session_id == session_id)).one()
    except SQLAlchemyError:
        current_app.logger.error("DB error: Unique user /experiment combo not found.")
    # lets try t o find all the session ids associated with the unique_id & exp_name combo
    session_id_list = []
    if experiment_name == "category_switch" :
        records = Category_switch.query.filter((Category_switch.gfgid == unique_id)).all()
        for r in records:
            if r.sess_id in session_id_list :
                print "in list, dont add"
            else :
                session_id_list = session_id_list + [r.sess_id]
    elif experiment_name == "keep_track" :
        print "you gotta query keeptrack"
    else :
        print "table name incorrect/not found"

    current_app.logger.info("%s session ids associated with %s unique_id" % (session_id_list, unique_id))
    try:
        resp = json.loads(user.datastring)
    except:
        resp = {
            "uniqueId": user.gfgid,
            "experimentName" : user.experimentname,
            "sessionid" : sess.session_id
        }
    return jsonify(**resp)

# called to updated the jSOn everytime and push it back to the table
@experiments.route('/sync/<id_exp>', methods=['PUT'])
def update(id_exp=None):
    print "------------------------------- inside '/sync/<id_exp>' update function in experiments.py-----------------------------------------------"    
    """
    Save experiment data, which should be a JSON object and will be stored after converting to string. """
    current_app.logger.info("PUT /sync route with id: %s" % id_exp)
    unique_id, experiment_name, session_id = id_exp.split("&")
    try:
        user = Participant.query.filter((Participant.gfgid == unique_id) & (Participant.experimentname == experiment_name)).one()
        sess = Session.query.filter((Session.gfgid == unique_id) & (Session.exp_name == experiment_name) & (Session.session_id == session_id)).one()
    except SQLAlchemyError:
        current_app.logger.error("DB error: Unique user not found.")
    # 1. get the JSOn from the request
    # 2. now add it to the participant table
    if hasattr(request, 'json'):
        print request.get_data()
        user.datastring = request.get_data().decode('utf-8').encode('ascii', 'xmlcharrefreplace')   #encoding the json
        db.session.add(user)
        db.session.commit()
    # 3.Now try to load the "datastring" from the participant table
    try:
        data = json.loads(user.datastring)
    except:
        data = {}
    # 4. Now extract the latest trial from this freshly saved data
    trial = data.get("currenttrial", None) 
    #print "trial is - ", trial
    current_app.logger.info("Saved Trial data for %s, experiment %s and trial# %s in Participant table" % (unique_id, experiment_name, trial))

    # 5. Now we will parse the recieved jSON and store each trial in the Category_Switch table 
    jsont = request.get_data()
    json_obj = json.dumps(jsont)

    # 6. Check if the json is valid
    try:
        valid = json.loads(json_obj)
    except ValueError, e:
        print "Not valid"
        #throw an error here and return out TBD

    valid_json = json.loads(jsont)
   #test code
    print "------------------- JSON PARSING Begins here -----------------------------"
    print "currenttrial of JSON :", valid_json['currenttrial']
    print "unique id  of JSON :", valid_json['uniqueId']
    print "Experiment Name of JSON :", valid_json['experimentName']
    print "session id  of JSON :", valid_json['sessionid']
   
    s = valid_json['sessionid']
    
    # 7. Extract session_id, experiment_name, uniqueid from JSON and compare it with request data
    if unique_id != valid_json['uniqueId']:
        print "Unique ID in request and jSON not matching. Create an error code for this one."
        #throw an error here and return out TBD
    elif int(session_id) != int(s):
        print "session_id ", session_id
        print "valid_json['sessionid'] ", s
        print "Session ID in request and jSON not matching. Create an error code for this one."
        #throw an error here and return out TBD
    elif experiment_name != valid_json['experimentName']:
        print "Experiment Name in request and jSON not matching. Create an error code for this one."
        #throw an error here and return out TBD
    else:
        current_app.logger.info("Log 013 - All the ids match between JSON and request")

    # 8. Query the appropriate table based on experiment name
    if valid_json['experimentName'] == "category_switch":
        # Query CategorySwitch table
        # Add all the trial numbers pertaining to that session id, unique_id combo into an array 
        current_app.logger.info("Querying %s table" % valid_json['experimentName'])
        row_matches = Category_switch.query.filter((Category_switch.gfgid == unique_id) & (Category_switch.sess_id == session_id)).all()
        trial_list = []
        for r in row_matches:
                trial_list = trial_list + [r.trial_num]
        current_app.logger.info("Log 014 - %s trials found for sessionid %s" %(trial_list, valid_json['sessionid']))
        print "Parsing the JSON ..........."
        for d in valid_json['data']:
            if d['current_trial'] in trial_list:
                rec = Category_switch.query.filter((Category_switch.gfgid == unique_id) & (Category_switch.sess_id == session_id) & (Category_switch.trial_num == d['current_trial'])).one()
                td = d['trialdata']
                if rec.response == td['resp']:
                    if rec.accuracy == td['acc']:
                        print "Record already exists"
                else:
                    print "Record exists but data seems different"
            else:
                td = d['trialdata']
                # Special case for accuracy
                if td['acc'] == "FORWARD" :
                    acc = 11    #numeric denotation of 'FORWARD' can be changed. TBD
                elif td['acc'] == "BACK" :
                    acc = 22
                elif td['acc'] == "NA" :
                    acc = 99
                else :
                    acc = td['acc']
                #Special case for reaction time
                if td['rt'] == "NA" :
                    rt = 0
                else :
                    rt = td['rt']
                # Datetime conversion
                jsts = d['dateTime']    #Javscript timestamp
                dt = datetime.datetime.fromtimestamp(jsts/1000.0) 
                # Block conversion
                block2 = td['block']; 
                block1 = block2.replace("\t", "").replace("\n", "").replace("'", "");  #need to replace special chars like - /, ',
                cs_info_trial = Category_switch(gfgid=unique_id, sess_id=session_id, trial_num=d['current_trial'], response=td['resp'], reaction_time=rt, accuracy=acc, block=block1, question="null", answer="null", user_answer="null", beginexp=dt)
                db.session.add(cs_info_trial)
                db.session.commit()
                current_app.logger.info("Log 016** - %s added to Category_Switch for session id %s " % (d['current_trial'], session_id))
   
    elif valid_json['experimentName'] == "keep_track":
        print "query KeepTrack table"
        # query KeepTrack table

    else:
        print "Table not found in database: %s " % valid_json['experimentName']
        #throw an error here and return out TBD

    resp = {"status": "user data saved"}
    return jsonify(**resp)

@experiments.route('/quitter', methods=['POST'])
def quitter():
    print "------------------------------- inside '/quitter' function in experiments.py-----------------------------------------------" 
    """ Mark quitter as such. """
    if not ('uniqueId' in request.form) or not ('experimentName' in request.form) or not ('sessionid' in request.form):
        resp = {"status": "bad request"}
        return jsonify(**resp)

    unique_id = request.form['uniqueId']
    experiment_name = request.form['experimentName']
    session_id = request.form['sessionid']

    if unique_id[:5] == "debug":
        debug_mode = True
    else:
        debug_mode = False

    """if debug_mode:
        resp = {"status": "didn't mark as quitter since this is debugging"}
        return jsonify(**resp)
    else:"""
    try:
        current_app.logger.info("Marking quitter %s in experiment %s" % (unique_id, experiment_name))
        user = Participant.query.filter((Participant.gfgid == unique_id) & (Participant.experimentname == experiment_name)).one()
        user.status = 6     # Quitter
        db.session.add(user)
        db.session.commit()

        #pull records from Session table to update
        sess = Session.query.filter((Session.gfgid == unique_id) & (Session.exp_name == experiment_name) & (Session.session_id == session_id)).one()
        print "** sess: ", sess
        sess.status = 6
        sess.begin_session = datetime.datetime.now()
        db.session.add(sess)
        db.session.commit()

    except SQLAlchemyError:
        raise ExperimentError('tried_to_quit')
    else:
        resp = {"status": "marked as quitter"}
        return jsonify(**resp)

@experiments.route('/worker_complete', methods=['GET'])
def worker_complete():
    print "------------------------------- inside '/worker_complete' function in experiments.py-----------------------------------------------" 
    """Complete worker."""

    if 'debug' in request.args:
        debug = request.args['debug']
    else:
        debug = False

    if not ('uniqueId' in request.args) or not ('experimentName' in request.args) or not ('sessionid' in request.args):
        raise ExperimentError('improper_inputs')
          
    else:
        unique_id = request.args['uniqueId']
        experiment_name = request.args['experimentName']
        session_id = request.args['sessionid']
        current_app.logger.info("Completed experiment %s, %s, %s" % (unique_id, experiment_name, session_id))
        try:
            user = Participant.query.filter((Participant.gfgid == unique_id) & (Participant.experimentname == experiment_name)).one()
            user.status = 3     #Status is Complete
            user.endhit = datetime.datetime.now()
            db.session.add(user)
            db.session.commit()

            #pull records from Session table to update
            sess = Session.query.filter((Session.gfgid == unique_id) & (Session.exp_name == experiment_name) & (Session.session_id == session_id)).one()
            print "** sess: ", sess
            sess.status = 3
            sess.begin_session = datetime.datetime.now()
            db.session.add(sess)
            db.session.commit()

        except SQLAlchemyError:
           raise ExperimentError('unknown_error')

        return redirect(url_for(".index", uniqueId=unique_id, new=False, debug=debug))

# Generic route
@experiments.route('/<pagename>')
@experiments.route('/<foldername>/<pagename>')
def regularpage(foldername=None, pagename=None):
    """
    Route not found by the other routes above. May point to a static template.
    """
    from jinja2.exceptions import TemplateNotFound

    try: 
        
        if foldername is None and pagename is not None:
            return render_template(pagename)
        else:
            return render_template(foldername+"/"+pagename)
    except TemplateNotFound:
        return render_template("error.html", errornum = 404)


@experiments.errorhandler(ExperimentError)
def handle_exp_error(exception):
    """Handle errors by sending an error page."""
    current_app.logger.error("%s (%s) %s", exception.value, exception.errornum, str(dict(request.args)))
    return exception.error_page(request, "delavega@colorado.edu")
