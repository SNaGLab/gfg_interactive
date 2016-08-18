// Generated by CoffeeScript 1.9.3
(function() {
  var Block, FeedbackTrial, IBI, ITI, Instruction, LivingKeyMap, PracFeedbackTrial, PracticeBlock, RTFeedbackBlock, SizeKeyMap, Slide1, Trial, blocks, c, clear_canvas, ctx, currSession, drawCircle, height, hideButtons, keyText, multilineText, n, red, trialLength, width,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  trialLength = 5000;

  ITI = 350;

  IBI = 3000;

  red = '#FF6C47';

  c = document.getElementById("canvas");

  ctx = c.getContext("2d");

  width = canvas.width;

  height = canvas.height;

  clear_canvas = function() {
    return ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  multilineText = function(txt, x, y, font, lineheight, clear, fillColor) {
    var i, lines, results;
    if (lineheight == null) {
      lineheight = 30;
    }
    if (clear == null) {
      clear = true;
    }
    if (fillColor == null) {
      fillColor = 'black';
    }
    if (clear) {
      clear_canvas();
    }
    ctx.fillStyle = fillColor;
    ctx.font = font;
    if (x === "center") {
      ctx.textAlign = "center";
      x = canvas.width / 2;
    } else {
      ctx.textAlign = "start";
    }
    if (y === "center") {
      y = canvas.height / 2;
    }
    lines = txt.split('\n');
    i = 0;
    results = [];
    while (i < lines.length) {
      ctx.fillText(lines[i], x, y + (i * lineheight));
      results.push(i++);
    }
    return results;
  };

  drawCircle = function(x, y, radius, fillColor, edgecolor, behind) {
    if (fillColor == null) {
      fillColor = null;
    }
    if (edgecolor == null) {
      edgecolor = 'black';
    }
    if (behind == null) {
      behind = true;
    }
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    if (behind) {
      ctx.globalCompositeOperation = "destination-over";
    } else {
      ctx.globalCompositeOperation = "source-over";
    }
    if (edgecolor != null) {
      ctx.lineWidth = 4;
      ctx.strokeStyle = edgecolor;
      ctx.stroke();
    }
    if (fillColor != null) {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }
    return ctx.globalCompositeOperation = "source-over";
  };

  hideButtons = function() {
    $("#leftButton").hide();
    return $("#rightButton").hide();
  };

  keyText = function(text, key, color) {
    if (key === 'left') {
      $("#leftText").html(text);
      $("#leftButton").show();
      return $("#leftButton").css('background-color', color);
    } else {
      $("#rightText").html(text);
      $("#rightButton").show();
      return $("#rightButton").css('background-color', color);
    }
  };

  Instruction = (function() {
    function Instruction(message, left_key, right_key, corrResp, left_color, right_color) {
      this.message = message;
      this.left_key = left_key != null ? left_key : null;
      this.right_key = right_key != null ? right_key : "Continue";
      this.corrResp = corrResp != null ? corrResp : null;
      this.left_color = left_color != null ? left_color : 'white';
      this.right_color = right_color != null ? right_color : 'white';
    }

    Instruction.prototype.start = function(exitTrial) {
      this.exitTrial = exitTrial;
      this.startTime = (new Date).getTime();
      multilineText(this.message, 10, 30, "25px Arial", 33);
      hideButtons();
      if (this.left_key != null) {
        keyText(this.left_key, 'left', this.left_color);
      }
      return keyText(this.right_key, 'right', this.right_color);
    };

    Instruction.prototype.keyPress = function(key) {
      var acc, rt;
      rt = (new Date).getTime() - this.startTime;
      if (this.corrResp != null) {
        if (this.corrResp === key) {
          $('#correct').modal('show');
          setTimeout(((function(_this) {
            return function() {
              return $('#correct').modal('hide');
            };
          })(this)), 2000);
          setTimeout(((function(_this) {
            return function() {
              return _this.exitTrial();
            };
          })(this)), 2000);
          acc = 1;
        } else {
          $('#error').modal('show');
          setTimeout(((function(_this) {
            return function() {
              return $('#error').modal('hide');
            };
          })(this)), 2000);
          acc = 0;
        }
      } else {
        if (key === 'f') {
          acc = 'BACK';
          this.exitTrial(false);
        } else if (key === 'j') {
          acc = 'FORWARD';
          this.exitTrial();
        }
      }
      return dataHandler.recordTrialData({
        'block': this.message,
        'rt': rt,
        'resp': key,
        'acc': acc
      });
    };

    return Instruction;

  })();

  Slide1 = (function(superClass) {
    extend(Slide1, superClass);

    function Slide1() {
      return Slide1.__super__.constructor.apply(this, arguments);
    }

    Slide1.prototype.start = function(exitTrial) {
      var fillColor;
      this.exitTrial = exitTrial;
      Slide1.__super__.start.call(this, this.exitTrial);
      multilineText("" + (String.fromCharCode(9888)), 0, 185, "80px Arial", 30, false, fillColor = 'red');
      return ctx.drawImage(jkey, 88, canvas.height - 127, 43, 43);
    };

    return Slide1;

  })(Instruction);

  LivingKeyMap = (function(superClass) {
    extend(LivingKeyMap, superClass);

    function LivingKeyMap() {
      return LivingKeyMap.__super__.constructor.apply(this, arguments);
    }

    LivingKeyMap.prototype.start = function(exitTrial) {
      this.exitTrial = exitTrial;
      LivingKeyMap.__super__.start.call(this, this.exitTrial);
      ctx.drawImage(fkey, 205, canvas.height - 197, 50, 50);
      return ctx.drawImage(jkey, 165, canvas.height - 130, 50, 50);
    };

    return LivingKeyMap;

  })(Instruction);

  SizeKeyMap = (function(superClass) {
    extend(SizeKeyMap, superClass);

    function SizeKeyMap() {
      return SizeKeyMap.__super__.constructor.apply(this, arguments);
    }

    SizeKeyMap.prototype.start = function(exitTrial) {
      this.exitTrial = exitTrial;
      SizeKeyMap.__super__.start.call(this, this.exitTrial);
      ctx.drawImage(fkey, 165, canvas.height - 135, 50, 50);
      return ctx.drawImage(jkey, 145, canvas.height - 65, 50, 50);
    };

    return SizeKeyMap;

  })(Instruction);

  Block = (function() {
    function Block(condition, message, trials) {
      this.condition = condition;
      this.message = message;
      this.trials = trials;
      this.trialNumber = 0;
      this.max_trials = this.trials.length;
      this.data = [];
    }

    Block.prototype.start = function(exitBlock) {
      this.exitBlock = exitBlock;
      hideButtons();
      multilineText(this.message, "center", "center", "33px Arial", 33);
      return setTimeout(((function(_this) {
        return function() {
          return _this.nextTrial();
        };
      })(this)), IBI);
    };

    Block.prototype.nextTrial = function() {
      this.currTrial = this.trials[this.trialNumber];
      if (this.trialNumber >= this.max_trials) {
        this.trialNumber++;
        return this.endBlock();
      } else {
        this.trialNumber++;
        return this.currTrial.show(((function(_this) {
          return function(arg1) {
            return _this.logTrial(arg1);
          };
        })(this)));
      }
    };

    Block.prototype.endBlock = function() {
      return this.exitBlock();
    };

    Block.prototype.logTrial = function(trialData) {
      dataHandler.recordTrialData({
        'block': this.condition,
        'rt': trialData[0],
        'resp': trialData[1],
        'acc': trialData[2]
      });
      this.data.push(trialData);
      return this.nextTrial();
    };

    Block.prototype.keyPress = function(key) {
      return this.currTrial.logResponse(key);
    };

    return Block;

  })();

  PracticeBlock = (function(superClass) {
    extend(PracticeBlock, superClass);

    function PracticeBlock() {
      return PracticeBlock.__super__.constructor.apply(this, arguments);
    }

    PracticeBlock.prototype.endBlock = function() {
      return this.feedback();
    };

    PracticeBlock.prototype.feedback = function() {
      var accs, n;
      accs = (function() {
        var j, len, ref, results;
        ref = this.data;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          n = ref[j];
          results.push(typeof n[2] === 'string' ? 0 : n[2]);
        }
        return results;
      }).call(this);
      this.accs = common.mean(accs);
      multilineText("You got " + (Math.round(this.accs * 100..toString())) + "% of trials correct", 10, 60, "30px Arial");
      if (this.accs < 0.75) {
        multilineText("You need to get at least 75% right to continue", 10, 130, "25px Arial", 20, false);
        keyText("Try again", 'left');
        return this.done = false;
      } else {
        multilineText("Good job, let's continue", 10, 130, "25px Arial", 20, false);
        keyText("Okay, continue", 'right');
        return this.done = true;
      }
    };

    PracticeBlock.prototype.keyPress = function(key) {
      if (this.trialNumber > this.max_trials) {
        if (this.done) {
          if (key === 'j') {
            return this.exitBlock();
          }
        } else if (key === 'f') {
          return this.restartBlock();
        }
      } else {
        return PracticeBlock.__super__.keyPress.call(this, key);
      }
    };

    PracticeBlock.prototype.restartBlock = function() {
      var j, len, ref, trial;
      ref = this.trials;
      for (j = 0, len = ref.length; j < len; j++) {
        trial = ref[j];
        trial.reset();
      }
      this.trialNumber = 0;
      this.data = [];
      hideButtons();
      dataHandler.recordTrialData({
        'block': this.condition,
        'rt': 'REST',
        'resp': 'REST',
        'acc': this.accs
      });
      return this.nextTrial();
    };

    return PracticeBlock;

  })(Block);

  RTFeedbackBlock = (function(superClass) {
    extend(RTFeedbackBlock, superClass);

    function RTFeedbackBlock() {
      return RTFeedbackBlock.__super__.constructor.apply(this, arguments);
    }

    RTFeedbackBlock.prototype.endBlock = function() {
      this.feedback();
      return setTimeout(((function(_this) {
        return function() {
          return _this.exitBlock();
        };
      })(this)), IBI);
    };

    RTFeedbackBlock.prototype.feedback = function() {
      var goodRTs, j, len, n, ref;
      ref = this.data;
      for (j = 0, len = ref.length; j < len; j++) {
        n = ref[j];
        goodRTs = n[0];
      }
      while (goodRTs.indexOf('NA') > -1) {
        goodRTs.splice(goodRTs.indexOf('NA'), 1);
      }
      return multilineText("Your average reaction time was: " + (common.mean(goodRTs).toString()) + "ms", 10, 30, "20px Arial");
    };

    return RTFeedbackBlock;

  })(Block);

  Trial = (function() {
    function Trial(item, corrResp) {
      this.item = item;
      this.corrResp = corrResp;
      this.rt = 'NA';
      this.resp = 'NA';
      this.acc = 'NA';
      this.flag = true;
    }

    Trial.prototype.reset = function() {
      this.rt = 'NA';
      this.resp = 'NA';
      this.acc = 'NA';
      return this.flag = true;
    };

    Trial.prototype.show = function(exitTrial) {
      this.exitTrial = exitTrial;
      clear_canvas();
      multilineText(this.processJudgment(this.corrResp), "center", canvas.height / 2 - 75, "40px Arial");
      return setTimeout(((function(_this) {
        return function() {
          _this.flag = false;
          multilineText(_this.item, "center", "center", "35px Arial", 20, false);
          _this.startTime = (new Date).getTime();
          return setTimeout((function() {
            return _this.endTrial();
          }), trialLength);
        };
      })(this)), ITI);
    };

    Trial.prototype.processJudgment = function(judgment) {
      var symbol;
      if (judgment === "living" || judgment === "nonliv") {
        symbol = String.fromCharCode(10084);
      } else {
        symbol = String.fromCharCode(10021);
      }
      return symbol;
    };

    Trial.prototype.endTrial = function() {
      var clear, fillColor, lineheight;
      if (this.flag === false) {
        this.flag = true;
        if (this.acc === 'NA') {
          multilineText("You took too long!", "center", canvas.height / 2 + 140, "30px Arial", lineheight = 20, clear = false);
          drawCircle(canvas.width / 2, canvas.height / 2 - 40, 100, fillColor = 'lightyellow');
        } else {
          drawCircle(canvas.width / 2, canvas.height / 2 - 40, 100, fillColor = 'lightyellow');
        }
        return setTimeout(((function(_this) {
          return function() {
            return _this.exitTrial([_this.rt, _this.resp, _this.acc]);
          };
        })(this)), ITI);
      }
    };

    Trial.prototype.logResponse = function(resp) {
      if (this.flag === false) {
        this.rt = (new Date).getTime() - this.startTime;
        this.resp = resp;
        if (resp === "f") {
          if (this.corrResp === "nonliv" || this.corrResp === "small") {
            this.acc = 1;
          } else {
            this.acc = 0;
          }
        } else if (resp === "j") {
          if (this.corrResp === "living" || this.corrResp === "big") {
            this.acc = 1;
          } else {
            this.acc = 0;
          }
        } else {
          this.acc = 'other';
        }
        return this.endTrial();
      }
    };

    return Trial;

  })();

  FeedbackTrial = (function(superClass) {
    extend(FeedbackTrial, superClass);

    function FeedbackTrial() {
      return FeedbackTrial.__super__.constructor.apply(this, arguments);
    }

    FeedbackTrial.prototype.endTrial = function() {
      var clear, lineheight, thisITI;
      if (this.flag === false) {
        this.flag = true;
        switch (this.acc) {
          case 0:
            drawCircle(canvas.width / 2, canvas.height / 2 - 40, 100, red);
            thisITI = ITI;
            break;
          case 'NA':
            drawCircle(canvas.width / 2, canvas.height / 2 - 40, 100, red);
            thisITI = ITI;
            break;
          case 1:
            clear_canvas();
            thisITI = ITI;
            break;
          case 'other':
            multilineText("Use only the F or J keys!", "center", canvas.height / 2 + 140, "30px Arial", lineheight = 20, clear = false);
            drawCircle(canvas.width / 2, canvas.height / 2 - 40, 100, red);
            thisITI = ITI;
        }
        return setTimeout(((function(_this) {
          return function() {
            return _this.exitTrial([_this.rt, _this.resp, _this.acc]);
          };
        })(this)), thisITI);
      }
    };

    return FeedbackTrial;

  })(Trial);

  PracFeedbackTrial = (function(superClass) {
    extend(PracFeedbackTrial, superClass);

    function PracFeedbackTrial() {
      return PracFeedbackTrial.__super__.constructor.apply(this, arguments);
    }

    PracFeedbackTrial.prototype.endTrial = function() {
      var clear, lineheight, thisITI;
      if (this.flag === false) {
        this.flag = true;
        switch (this.acc) {
          case 0:
            drawCircle(canvas.width / 2, canvas.height / 2 - 40, 100, red);
            thisITI = ITI;
            break;
          case 'NA':
            multilineText("You took too long!", "center", canvas.height / 2 + 140, "30px Arial", lineheight = 20, clear = false);
            drawCircle(canvas.width / 2, canvas.height / 2 - 40, 100, red);
            thisITI = ITI;
            break;
          case 1:
            clear_canvas();
            thisITI = ITI;
            break;
          case 'other':
            multilineText("Use only the F or J keys!", "center", canvas.height / 2 + 140, "30px Arial", lineheight = 20, clear = false);
            drawCircle(canvas.width / 2, canvas.height / 2 - 40, 100, red);
            thisITI = ITI;
        }
        return setTimeout(((function(_this) {
          return function() {
            return _this.exitTrial([_this.rt, _this.resp, _this.acc]);
          };
        })(this)), thisITI);
      }
    };

    return PracFeedbackTrial;

  })(Trial);

  jQuery(function() {
    $(document).keypress(function(event) {
      return currSession.keyPress(event);
    });
    return $("body").on('click', 'button', function() {
      return currSession.buttonClick();
    });
  });

  blocks = [
    new Slide1(instructions[0]), new Instruction(instructions[1], "Back"), new Instruction(instructions[2], "Back"), new Instruction(instructions[3], "Bigger or smaller than soccer ball", "Living or non-living", "j"), new Instruction(instructions[4], "Bigger or smaller than soccer ball", "Living or non-living", "f"), new LivingKeyMap(instructions[5], "Back"), new Instruction(instructions[6], " ", " ", "j"), new Instruction(instructions[7]), new Instruction(instructions[8], "Back", "Start practice!", null, 'white', '#66FF99'), new common.FinishInstructions, new PracticeBlock("livingPrac", "Get ready for 12 words!\n\nRespond as quickly as you can\nwithout making mistakes.", (function() {
      var j, len, ref, results;
      ref = all_stim['living_prac'];
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        n = ref[j];
        results.push(new PracFeedbackTrial(n[0], n[1]));
      }
      return results;
    })()), new Instruction(instructions[9], null, "Continue"), new Block("livingReal", "Get ready for 34 words!", (function() {
      var j, len, ref, results;
      ref = all_stim['living_real'];
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        n = ref[j];
        results.push(new FeedbackTrial(n[0], n[1]));
      }
      return results;
    })()), new SizeKeyMap(instructions[10], null), new Instruction(instructions[11], " ", " ", "f"), new Instruction(instructions[12], "Back", "Start practice!", null, 'white', '#66FF99'), new PracticeBlock("sizePrac", "Get ready for 12 words!\n\nRespond as quickly as you can\nwithout making mistakes.", (function() {
      var j, len, ref, results;
      ref = all_stim['size_prac'];
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        n = ref[j];
        results.push(new PracFeedbackTrial(n[0], n[1]));
      }
      return results;
    })()), new Instruction(instructions[13], null, "Start!", null, 'white', '#66FF99'), new Block("sizeReal", "Get ready for 34 words!\n\nRespond as quickly as you can\nwithout making mistakes.", (function() {
      var j, len, ref, results;
      ref = all_stim['size_real'];
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        n = ref[j];
        results.push(new FeedbackTrial(n[0], n[1]));
      }
      return results;
    })()), new Instruction(instructions[14], null, "Start practice!", null, 'white', '#66FF99'), new PracticeBlock("mixedPrac", "Get ready for 24 words!\n\nRespond as quickly as you can\nwithout making mistakes.", (function() {
      var j, len, ref, results;
      ref = all_stim['mixed_prac'];
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        n = ref[j];
        results.push(new PracFeedbackTrial(n[0], n[1]));
      }
      return results;
    })()), new Instruction(instructions[15], null, "Start!", null, 'white', '#66FF99'), new Block("mixedReal1", "Get ready for 54 words!\n\nRespond as quickly as you can\nwithout making mistakes.", (function() {
      var j, len, ref, results;
      ref = all_stim['mixed_real_1'];
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        n = ref[j];
        results.push(new FeedbackTrial(n[0], n[1]));
      }
      return results;
    })()), new Instruction(instructions[16], null, "Start!", null, 'white', '#66FF99'), new Block("mixedReal2", "Get ready for 54 words!\n\nRespond as quickly as you can\nwithout making mistakes.", (function() {
      var j, len, ref, results;
      ref = all_stim['mixed_real_2'];
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        n = ref[j];
        results.push(new FeedbackTrial(n[0], n[1]));
      }
      return results;
    })()), new common.Questionnaire
  ];

  currSession = new common.Session(blocks);

  fkey.onload = (function() {
    return currSession.start();
  });

  jkey.onload = (function() {
    return currSession.start();
  });

}).call(this);
