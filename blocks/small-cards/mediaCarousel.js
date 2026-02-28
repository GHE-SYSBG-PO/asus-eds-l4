/* eslint-disable comma-dangle, no-multiple-empty-lines, prefer-const, quotes,
   one-var, one-var-declaration-per-line, no-undef, object-shorthand,
   indent, semi, padded-blocks, func-names, space-before-function-paren,
   eqeqeq, no-restricted-properties, operator-assignment, eol-last, no-unused-vars,
   prefer-arrow-callback, no-console, prefer-exponentiation-operator,
   no-cond-assign, no-unneeded-ternary, no-multi-assign, prefer-destructuring,
   quote-props, new-cap */

function NoiseCancellation() {
  let currentAriaLabel;
  let currentEventName;
  const TimelineMax = window.gsap;
  const KEY_ENTER = 13;
  let $voiceContainer;
  let $leftCanvas;
  let $rightCanvas;
  let ctxLeft;
  let ctxRight;
  let audioSoundTrack;
  let phase;
  let $noiseNav;
  let $noiseBtnNav;
  let $noiseBtnCancel;
  let $noiseBtnSwitcherContainer;
  let $noiseBtnSwitcher;
  let $noiseBtnSwitcherLabel;
  let $noiseVoiceContainer;
  let $noiseVoiceReplay;
  let $adaDesc;
  let $outerModalBtn;
  let $innerModalBtn;
  let saveCurrentAudioTime;
  let amplitude;
  let halfWidth;
  let halfHeight;
  let _waveConfig;
  let ifGsapTweenToNewValue;
  let isWeakWaveActive;
  let isNoiseModeActive;
  let alphaValue;
  let THEME_COLOR;
  let voiceStripe;

  let _config = {
    isInner: false,
    container: '',
    leftCanvas: '.noise__left',
    rightCanvas: '.noise__right',
    btnCancel: '.img__switcher',
    btnSwitcher: '.noise__switcher',
    audioSoundTrack: '.noise__audio',
    themeColor: {
      main: '95, 95, 95',
      middle: '165, 165, 165',
      filter: '181, 223, 255'
    },
    waveConfig: {
      debug: false,
      width: 800,
      height: 400,
      speed: 0.09,
      frequency: 3,
      noiseLevelStart: 0,
      noiseLevelEnd: 0,
      weakShakeLevel: 0,
      resetDuration: 0.5,
      tweenDuration: 1.5,
      boomLevel: {
        start: 150,
        end: 600
      },
      alphaValue: 0,
      isNoiseModeActive: false,
      ifGsapTweenToNewValue: false,
      isWeakWaveActive: false,
      phase: 0,
      audioTrack: [{
        noise: './src/audio/cafe/scene-noise.mp3',
        filter: './src/audio/cafe/scene.mp3'
      }]
    }
  };


  function _isExist(_element) {
    return _element.length > 0;
  }

  let ease = "none";
  let tlStart, tlEnd, tlweak;

  function AiNoiseEnded() {
    if (!_config.isInner) {
      $("body").trigger('AiNoiseEnded');
    }
  }

  function tweenNoiseLevelStart(level) {
    tlStart = TimelineMax
      .to(_waveConfig, {
        duration: _waveConfig.resetDuration,
        noiseLevelStart: 0,
        ease: ease,
        repeat: 0,
        onComplete: () => {
          if (!ifGsapTweenToNewValue) {
            return;
          }
          tlStart = TimelineMax.to(_waveConfig, {
            duration: _waveConfig.tweenDuration,
            noiseLevelStart: level,
            ease: ease,
            repeat: 0,
          })
        }
      })
  }

  function tweenNoiseLevelEnd(level) {
    tlEnd = TimelineMax
      .to(_waveConfig, {
        duration: _waveConfig.resetDuration,
        noiseLevelEnd: 0,
        ease: ease,
        repeat: 0,
        onComplete: () => {
          if (!ifGsapTweenToNewValue) {
            return;
          }
          tlEnd = TimelineMax.to(_waveConfig, {
            duration: _waveConfig.tweenDuration,
            noiseLevelEnd: level,
            ease: ease,
            repeat: 0,
          });
        }
      })

  }

  function tweenWeakLevel(level) {
    tlweak = TimelineMax.to(_waveConfig, {
      duration: _waveConfig.resetDuration,
      weakShakeLevel: 0,
      ease: ease,
      repeat: 0,
      onComplete: () => {
        isWeakWaveActive = false;
        if (!ifGsapTweenToNewValue) {
          return;
        }
        tlweak = TimelineMax.to(_waveConfig, {
          duration: _waveConfig.tweenDuration,
          weakShakeLevel: level,
          ease: ease,
          repeat: 0,
        })
      }
    })
  }

  function _handleAllClickEvents() {
    let currentTime = new Date().getTime();
    $noiseBtnNav.on('keydown click', function(e) {
      if (e.keyCode !== KEY_ENTER && e.type == 'keydown') {
        return;
      }
      let $self = $(this);
      $noiseVoiceReplay.addClass('is-hidden');
      $noiseVoiceReplay.attr('aria-hidden', 'true');
      $noiseVoiceReplay.attr('tabindex', '-1');

      const _time = new Date().getTime();
      if (_time - currentTime < 300) {
        return;
      }
      currentTime = _time;
      e.preventDefault();
      e.stopPropagation();

      let saveCurrentStatus = $(this).attr('data-status');
      navCurrentIndex = 1;

      isNoiseModeActive = false;
      ifGsapTweenToNewValue = true;

      audioSoundTrack.pause();
      $noiseBtnSwitcherContainer.removeClass('js-showed');
      $noiseBtnSwitcherContainer.attr('aria-hidden', 'true');
      $noiseBtnNav.removeClass('js-selected');
      $noiseBtnCancel.removeClass('js-active');
      $noiseBtnCancel.attr('aria-checked', false);
      $noiseVoiceContainer.removeClass('js-active');
      $voiceContainer.removeClass('js-active');

      $noiseBtnNav.attr('data-status', 'off');
      $noiseBtnSwitcherLabel.attr('aria-hidden', 'true');

      let navStatus = 'off';

      if (saveCurrentStatus === 'off') {

        $voiceContainer.addClass('js-active');
        $noiseBtnSwitcherContainer.addClass('js-showed');
        $noiseBtnSwitcherContainer.attr('aria-hidden', 'false');
        $noiseVoiceContainer.addClass('js-active');

        tweenNoiseLevelStart(3);
        tweenNoiseLevelEnd(5);
        tweenWeakLevel(3.5);

        audioSoundTrack.src = _waveConfig.audioTrack[0].noise;
        audioSoundTrack.play();

        $(this).attr('data-status', 'on');
        $(this).addClass('js-selected');
        currentAriaLabel = $(this).find('.nav__aria_data').attr('data-desc-start');
        currentEventName = $(this).find('.nav__aria_data').attr('data-event-start');
        $noiseBtnSwitcherLabel.attr('aria-hidden', 'false');

      } else {
        navStatus = 'on';

        ifGsapTweenToNewValue = false;

        if (tlStart) tlStart.kill();
        if (tlEnd) tlEnd.kill();
        if (tlweak) tlweak.kill();

        tweenNoiseLevelStart(0);
        tweenNoiseLevelEnd(0);
        tweenWeakLevel(0);
        AiNoiseEnded();
        $(this).attr('data-status', 'off');
        currentAriaLabel = $(this).find('.nav__aria_data').attr('data-desc-stop');
        currentEventName = $(this).find('.nav__aria_data').attr('data-event-stop');

        $noiseBtnSwitcherLabel.attr('aria-hidden', 'true');
      }

      eventname = $self.attr('data-eventname');

      $(this).attr('aria-label', currentAriaLabel);
      $(this).attr('data-eventname', currentEventName);
      const currentADAdesc = $(this).find('.nav__aria_data').attr('data-desc-ai');
      $adaDesc.text(currentADAdesc);
    });

    const _handleImgSwitcherGa = () => {
      const ariaChecked = $noiseBtnCancel.attr('aria-checked');
    };

    $noiseBtnCancel.on('keydown click', function(e) {
      if (e.keyCode !== KEY_ENTER && e.type == 'keydown') {
        return;
      }
      const _time2 = new Date().getTime();
      if (_time2 - currentTime < 300) {
        return;
      }
      currentTime = _time2;
      e.preventDefault();
      e.stopPropagation();

      _handleImgSwitcherGa();

      audioSoundTrack.pause();
      saveCurrentAudioTime = audioSoundTrack.currentTime;

      let targetNav = $noiseNav.find(".nav__item.js-selected");

      if (isNoiseModeActive) {
        isNoiseModeActive = false;
        $noiseBtnCancel.removeClass('js-active');
        $noiseBtnCancel.attr('aria-checked', false);
        isWeakWaveActive = false;
        audioSoundTrack.src = _waveConfig.audioTrack[0].noise;
        audioSoundTrack.play();
        audioSoundTrack.currentTime = saveCurrentAudioTime;
        currentAriaLabel = targetNav.find('.nav__aria_data').attr('data-desc-start');
        currentEventName = targetNav.find('.nav__aria_data').attr('data-event-start');
        targetNav.attr('aria-label', currentAriaLabel);
        targetNav.attr('data-eventname', currentEventName);
        $noiseBtnSwitcherLabel.text($noiseBtnSwitcher.data('off'));
      } else {
        isNoiseModeActive = true;
        $noiseBtnCancel.addClass('js-active');
        $noiseBtnCancel.attr('aria-checked', true);
        isWeakWaveActive = true;
        audioSoundTrack.src = _waveConfig.audioTrack[0].filter;
        audioSoundTrack.play();

        audioSoundTrack.currentTime = saveCurrentAudioTime;
        currentAriaLabel = targetNav.find('.nav__aria_data').attr('data-desc-ai');
        targetNav.attr('aria-label', currentAriaLabel);
        $noiseBtnSwitcherLabel.text($noiseBtnSwitcher.data('on'));
      }
    });

    if (_config.isInner) {
      $outerModalBtn.on('keydown click', function(e) {
        if (e.keyCode !== KEY_ENTER && e.type == 'keydown') {
          return;
        }
        $noiseNav.find('.nav__item.js-selected').trigger('click');
      });

      $innerModalBtn.on('keydown click', function(e) {
        if (e.keyCode !== KEY_ENTER && e.type == 'keydown') {
          return;
        }
        $noiseNav.find('.nav__item.js-selected').trigger('click');
      });
    }

    audioSoundTrack.addEventListener('ended', function() {
      console.log('[VoiceNoise] audioSoundTrack - ended');

      tweenNoiseLevelStart(0);
      tweenNoiseLevelEnd(0);
      tweenWeakLevel(0);

      $noiseVoiceReplay.removeClass('is-hidden');
      $noiseVoiceReplay.attr('aria-hidden', 'false');
      $noiseVoiceReplay.attr('tabindex', '0');

      AiNoiseEnded();
    });
  }

  function _handleReplay() {
    $noiseVoiceReplay.on('keydown click', function(e) {
      if (e.keyCode !== KEY_ENTER && e.type == 'keydown') {
        return;
      }

      navCurrentIndex = 1;

      tweenNoiseLevelStart(3);
      tweenNoiseLevelEnd(5);
      tweenWeakLevel(3.5);

      audioSoundTrack.src = _waveConfig.audioTrack[0].noise;
      audioSoundTrack.play();

      $noiseVoiceReplay.addClass('is-hidden');
      $noiseVoiceReplay.attr('aria-hidden', 'true');
      $noiseVoiceReplay.attr('tabindex', '-1');

      isNoiseModeActive = false;
      $noiseBtnCancel.removeClass('js-active');
      $noiseBtnCancel.attr('aria-checked', false);
      isWeakWaveActive = false;

      const targetNav = $noiseNav.find(".nav__item.js-selected");
      currentAriaLabel = targetNav.find('.nav__aria_data').attr('data-desc-start');
      currentEventName = targetNav.find('.nav__aria_data').attr('data-event-start');
      targetNav.attr('aria-label', currentAriaLabel);
      targetNav.attr('data-eventname', currentEventName);

      $noiseBtnSwitcherLabel.text($noiseBtnSwitcher.data('off'));
    });
  }

  function getMaxValueRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function _globAttFunc(x) {
    return Math.pow(getMaxValueRandom(_waveConfig.noiseLevelStart, _waveConfig.noiseLevelEnd) / (4 + Math.pow(x, 4)), 1.5);
  }

  function _globWeakAttFunc(x) {
    return Math.pow(_waveConfig.weakShakeLevel / (4 + Math.pow(x, 4)), 3);
  }

  function _calcPosX(i) {
    return halfWidth + i * (halfWidth / 2);
  }

  function _calcPosY(i, attenuation) {
    let att = (getMaxValueRandom(150, 600) * amplitude) / attenuation;
    return halfHeight + _globAttFunc(i) * att * Math.sin(getMaxValueRandom(3, 5) * i - phase);
  }

  function _calcWeakPosY(i, attenuation) {
    let att = (_waveConfig.height * amplitude) / attenuation;
    return halfHeight + _globWeakAttFunc(i) * att * Math.sin(_waveConfig.frequency * i - phase);
  }

  function _clearRect() {
    ctxLeft.clearRect(0, 0, _waveConfig.width, _waveConfig.height);
    ctxRight.clearRect(0, 0, _waveConfig.width, _waveConfig.height);
  }

  function _drawLeftWaveLine(attenuation, color, lineWidth) {
    ctxLeft.moveTo(0, 0);
    ctxLeft.beginPath();
    ctxLeft.strokeStyle = color;
    ctxLeft.lineWidth = lineWidth || 1;

    let i = -2;
    while ((i = i + 0.01) <= 2) {
      ctxLeft.lineTo(_calcPosX(i), _calcPosY(i, attenuation));
    }
    ctxLeft.stroke();
  }

  function _drawRightWaveLine(attenuation, color, lineWidth) {
    ctxRight.moveTo(0, 0);
    ctxRight.beginPath();
    ctxRight.strokeStyle = color;
    ctxRight.lineWidth = lineWidth || 1;
    let i = -2;
    while ((i = i + 0.01) <= 2) {
      ctxRight.lineTo(_calcPosX(i), isWeakWaveActive ? _calcWeakPosY(i, attenuation) : _calcPosY(i, attenuation));
    }
    ctxRight.stroke();
  }

  let noiseStripe;
  let pureStripe;

  function _drawAnimate() {
    noiseStripe = voiceStripe.noise;
    pureStripe = voiceStripe.pure;
    if (!noiseStripe || noiseStripe.length <= 0 || !pureStripe || pureStripe.length <= 0) {
      return;
    }
    phase = (phase + Math.PI * _waveConfig.speed) % (2 * Math.PI);
    _clearRect();
    alphaValue = alphaValue + 0.01;
    if (alphaValue >= 1) {
      alphaValue = 1;
    }

    ctxLeft.globalAlpha = alphaValue;
    ctxRight.globalAlpha = alphaValue;
    (function() {
      for (let i = 0; i < noiseStripe.length; i = i + 1) {
        _drawLeftWaveLine(
          noiseStripe[i].strength,
          `rgba(${noiseStripe[i].color}, ${noiseStripe[i].opacity})`,
          noiseStripe[i].strokeWidth,
          i === (noiseStripe.length - 1) ? true : false
        );
      }
    }());

    if (isWeakWaveActive) {
      (function() {
        for (let i = 0; i < pureStripe.length; i = i + 1) {
          _drawRightWaveLine(
            pureStripe[i].strength,
            `rgba(${pureStripe[i].color}, ${pureStripe[i].opacity})`,
            pureStripe[i].strokeWidth
          );
        }
      }());
    } else {
      (function() {
        if (!noiseStripe || noiseStripe.length <= 0) {
          return;
        }
        for (let i = 0; i < noiseStripe.length; i = i + 1) {
          _drawRightWaveLine(
            noiseStripe[i].strength,
            `rgba(${noiseStripe[i].color}, ${noiseStripe[i].opacity})`,
            noiseStripe[i].strokeWidth
          );
        }
      }());
    }
    window.requestAnimationFrame(_drawAnimate);
  }

  const setVoiceStripe = function(key, _value) {
    if (!voiceStripe) {
      voiceStripe = [];
    }
    voiceStripe[key] = _value;
  };

  this.init = function(_cfg) {
    _config = $.extend({}, _config, _cfg);
    $voiceContainer = $(_config.container);

    if (!_isExist($voiceContainer)) {
      return;
    }
    // gaLabelHeader = $voiceContainer.attr('data-galabelheader') || 'Ai Noise';
    eventname = $voiceContainer.attr('data-eventname');
    THEME_COLOR = _config.themeColor;
    _waveConfig = _config.waveConfig;
    ifGsapTweenToNewValue = _waveConfig.ifGsapTweenToNewValue;
    isNoiseModeActive = _waveConfig.isNoiseModeActive;
    phase = _waveConfig.phase;
    isWeakWaveActive = _waveConfig.isWeakWaveActive;
    alphaValue = _waveConfig.alphaValue;
    amplitude = Math.max(Math.min(_waveConfig.speed, 1), 0);

    halfWidth = _waveConfig.width / 2;
    halfHeight = _waveConfig.height / 2;
    $leftCanvas = $voiceContainer.find(_config.leftCanvas);
    $rightCanvas = $voiceContainer.find(_config.rightCanvas);

    if (!_isExist($rightCanvas) || !_isExist($leftCanvas)) {
      return;
    }

    $leftCanvas[0].width = $rightCanvas[0].width = _waveConfig.width;
    $leftCanvas[0].height = $rightCanvas[0].height = _waveConfig.height;
    ctxLeft = $leftCanvas[0] ? $leftCanvas[0].getContext('2d') : false;
    ctxRight = $rightCanvas[0] ? $rightCanvas[0].getContext('2d') : false;
    if (!ctxLeft || !ctxRight) {
      return;
    }

    audioSoundTrack = $voiceContainer.find(_config.audioSoundTrack)[0];
    $noiseNav = $voiceContainer.find('.nav__noise');
    $noiseBtnNav = $noiseNav.find('.nav__item');
    $noiseBtnCancel = $voiceContainer.find('.img__switcher');
    $noiseBtnSwitcherContainer = $voiceContainer.find('.noise__switcher');
    $noiseBtnSwitcher = $noiseBtnSwitcherContainer.find('.aiNoiseSwitcher_btn');
    $noiseBtnSwitcherLabel = $noiseBtnSwitcherContainer.find(`[for="${$noiseBtnSwitcher.attr('id')}"]`);
    $noiseVoiceContainer = $voiceContainer.find('.noise__voice__container');
    $noiseVoiceReplay = $voiceContainer.find('.nav__replay .wd__play__btn-button');
    eventnameSwitch = $noiseBtnCancel.attr('data-eventname');
    eventnameReplay = $noiseVoiceReplay.attr('data-eventname');

    if (!voiceStripe) {
      setVoiceStripe('noise', [{
          strength: -4,
          opacity: 1,
          color: THEME_COLOR.middle,
          strokeWidth: 0.4
        },
        {
          strength: -2,
          opacity: 1,
          color: THEME_COLOR.middle,
          strokeWidth: 0.4
        },
        {
          strength: 2,
          opacity: 0.9,
          color: THEME_COLOR.main,
          strokeWidth: 1
        },
        {
          strength: 1,
          opacity: 1,
          color: THEME_COLOR.main,
          strokeWidth: 1.6
        }
      ]);

      setVoiceStripe('pure', [{
          strength: -5,
          opacity: 0.4,
          color: THEME_COLOR.middle,
          strokeWidth: 0.4
        },
        {
          strength: 6,
          opacity: 0.5,
          color: THEME_COLOR.middle,
          strokeWidth: 0.7
        },
        {
          strength: 1,
          opacity: 1,
          color: THEME_COLOR.filter,
          strokeWidth: 2.6
        }
      ]);
    }
    $adaDesc = $voiceContainer.find('.adaDesc');

    _drawAnimate();
    _handleAllClickEvents();
    _handleReplay();
  };

  this.setVoiceStripe = setVoiceStripe;
}

function aiNoise() {
  let _config = {
    "THEME_COLOR": {
      main: '95, 95, 95',
      middle: '165, 165, 165',
      filter: '181, 223, 255'
    }
  };

  function _handleBlocksVoiceNoise($container) {
    const THEME_COLOR = _config.THEME_COLOR;
    const noiseContainer = $container.find('.ai__noise__container');
    if (!noiseContainer) {
      return;
    }

    function getColor($item, key) {
      const _item = window.getComputedStyle($($item)[0]);
      return _item.getPropertyValue(`--themecolor-${key}`) ? _item.getPropertyValue(`--themecolor-${key}`) : THEME_COLOR[key];
    }

    $(noiseContainer).each(function(index, element) {
      (function() {
        let aiNoiseAni = new NoiseCancellation();

        let themeColor = {
          main: getColor(element, 'main'),
          middle: getColor(element, 'middle'),
          filter: getColor(element, 'filter')
        };

        aiNoiseAni.init({
          isInner: false,
          container: $(element),
          themeColor: themeColor
        });
      }());
    });
  }

  this.init = ($container) => {
    if (!$container) {
      return;
    }
    _handleBlocksVoiceNoise($container);
  };
}


export default function MediaCarousel() {
  this.init = function() {
    const $swiperCarousels = $('.item__media--aiNoise').parent();
    if ($swiperCarousels.length === 0) return;

    setTimeout(() => {
      const AiNoise = new aiNoise();
      AiNoise.init($('body'));
    }, 100);
  }
}