/**
 * adapted from jspsych-image-keyboard-response
 * Sonia Poltoratski 2020
 *
 * plugin for displaying a target image, and asking participant to judge 2 other images
 * on prompt e.g. 'which of these is most similar to the target image?'
 *
 **/


jsPsych.plugins["imageTriad-keyboard-response"] = (function () {

  var plugin = {};
  jsPsych.pluginAPI.registerPreload('imageTriad-keyboard-response', 'targ_opt1_opt2', 'image');

  plugin.info = {
    name: 'imageTriad-keyboard-response',
    description: '',
    parameters: {
      targ_opt1_opt2: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Target + 2 Option Images',
        default: undefined,
        description: 'The image triad to be displayed'
      },
      image_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Image height/width',
        default: 200,
        description: 'Set the image size in pixels'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: ['f', 'j'], //jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: '<p>Which image looks most similar to <span style="color: green; font-weight: bold;">this one?</span></p></div>',
        description: 'Description of the comparison the subject will make.'
      },
      randomize_LR: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Randomize left/right images',
        default: true,
        description: 'Randomize whether each option image is the left or right.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when subject makes a response.'
      },
    }
  }

  plugin.trial = function (display_element, trial) {

    var leftRight = [1, 2];
    if (trial.randomize_LR) {
      leftRight = jsPsych.randomization.shuffle(leftRight);
    }

    // display target image
    var html = '<div style="margin: 0 auto; text-align: center; margin-top: 0px">' +
      '<img id = "targetIm" src="'+trial.targ_opt1_opt2[0]+'" style="width: '+trial.image_size+'px; padding: 2px; border: 5px solid green">' +
        trial.prompt;

    // display option images
    var keyText = trial.choices.map(function(x){ return x.toUpperCase()});

    html += '<div style="text-align: center"> ' +
      '<figure style=" display: inline-block; margin: 50px 20px; padding: 5px; "> ' +
      '<img src="'+trial.targ_opt1_opt2[leftRight[0]]+'" style="width: '+trial.image_size+'px"> ' +
      '<figcaption style="padding: 10px; text-align: center">Press '+keyText[0]+'</figcaption></figure> ' +
      '<figure style=" display: inline-block; margin: 50px 20px; padding: 5px; "> ' +
      '<img src="'+trial.targ_opt1_opt2[leftRight[1]]+'" style="width: '+trial.image_size+'px"> ' +
      '<figcaption style="padding: 10px; text-align: center">Press '+keyText[1]+'</figcaption></figure></div> ';

    // render
    display_element.innerHTML = html;

    // store response
    var response = {
      rt: null,
      key: null
    };

    // function to end trial when it is time
    var end_trial = function () {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "target": trial.targ_opt1_opt2[0],
        "leftRight_order": leftRight,
        "options":[trial.targ_opt1_opt2[1],trial.targ_opt1_opt2[2]],
        "key_press": response.key
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function (info) {

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector('#targetIm').className += ' responded';

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // start the response listener
    if (trial.choices != jsPsych.NO_KEYS) {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
      });
    }

  };

  return plugin;
})();
