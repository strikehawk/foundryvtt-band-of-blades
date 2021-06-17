/**
 * Roll Dice.
 * @param {int} dice_amount
 * @param {string} attribute_name
 * @param {string} position
 * @param {string} effect
 */
export async function bobRoll( dice_amount, attribute_name = "", position = "risky", effect = "standard") {

  let zeromode = false;

  if ( dice_amount < 0 ) { dice_amount = 0; }
  if ( dice_amount === 0 ) { zeromode = true; dice_amount = 2; }

  let r = new Roll( `${dice_amount}d6`, {} );

  await r.evaluate({async: true});
  await showChatRollMessage( r, zeromode, attribute_name, position, effect );
}

/**
 * Shows Chat message.
 *
 * @param {Roll} r
 * @param {Boolean} zeromode
 * @param {String} attribute_name
 * @param {string} position
 * @param {string} effect
 */
async function showChatRollMessage(r, zeromode, attribute_name = "", position = "", effect = "") {

  let speaker = ChatMessage.getSpeaker();
  let attribute_label = BoBHelpers.getAttributeLabel(attribute_name);
  let rolls = (r.terms)[0].results;

  // Retrieve Roll status.
  let roll_status;
  let resistance_rolls = Object.keys( game.system.model.Actor.character.attributes );
  if( resistance_rolls[resistance_rolls.length - 1] === "specialist" ) { resistance_rolls.pop(); }
  let stress_result = 0;
  let stress_result_display = 0;
  let vice_result = 0;


  if ( attribute_name === "Fortune!" ) {
	  roll_status = getFortuneRollStatus(rolls, zeromode);
  } else if ( resistance_rolls.includes( attribute_name ) ) {
	  [ roll_status, stress_result ] = getResistRollStatus(rolls, zeromode);
	  stress_result_display = ( 6 - stress_result );
	  position = "";
	  effect = "";
  } else if ( attribute_name === "pressure" ) {
	  roll_status = getPressureRollStatus(rolls, zeromode);
	  position = "";
	  effect = "";
  } else if ( attribute_name === "engagement" ) {
    roll_status = getEngagementRollStatus(rolls, zeromode);
    position = "";
    effect = "";
  } else if ( attribute_name === "alchemists" ) {
    roll_status = getAlchemistRollStatus(rolls, zeromode);
    position = "";
    effect = "";
  } else {
	  roll_status = getActionRollStatus(rolls, zeromode);
  }

  let position_localize;
  switch (position) {
    case 'controlled':
      position_localize = 'BITD.PositionControlled'
      break;
    case 'desperate':
      position_localize = 'BITD.PositionDesperate'
      break;
    case 'risky':
    default:
      position_localize = 'BITD.PositionRisky'
  }

  let effect_localize;
  switch (effect) {
    case 'limited':
      effect_localize = 'BITD.EffectLimited'
      break;
    case 'great':
      effect_localize = 'BITD.EffectGreat'
      break;
    case 'standard':
    default:
      effect_localize = 'BITD.EffectStandard'
  }

  let result = await renderTemplate("systems/band-of-blades/templates/bob-roll.html", {rolls: rolls, roll_status: roll_status, attribute_label: attribute_label, position: position, position_localize: position_localize, effect: effect, effect_localize: effect_localize, stress_result_display: stress_result_display, vice_result: vice_result, zeromode: zeromode});

  let messageData = {
    speaker: speaker,
    content: result,
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    roll: r
  }

  await CONFIG.ChatMessage.documentClass.create(messageData, {});
}

/**
 * Get status of the Roll.
 *  - failure
 *  - partial-success
 *  - success
 *  - critical-success
 * @param {Array} rolls
 * @param {Boolean} zeromode
 */
export function getActionRollStatus(rolls, zeromode = false) {

  let sorted_rolls = rolls.map(i => i.result).sort();
  let roll_status;
  let use_die;
  let prev_use_die;

  if (zeromode) {
    use_die = sorted_rolls[0];
  } else {
    use_die = sorted_rolls[sorted_rolls.length - 1];
    if (sorted_rolls.length - 2 >= 0) {
      prev_use_die = sorted_rolls[sorted_rolls.length - 2]
    }
  }

  // 1,2,3 = failure
  if (use_die <= 3) {
    roll_status = "failure";
  } else if (use_die === 6) {
    // if 6 - check the prev highest one.
    // 6,6 - critical success
    if (prev_use_die && prev_use_die === 6) {
      roll_status = "critical-success";
    } else {
    // 6 - success
      roll_status = "success";
    }
  } else {
    // else (4,5) = partial success
    roll_status = "partial-success";
  }

  return roll_status;
}

export function getFortuneRollStatus(rolls, zeromode = false) {

  let sorted_rolls = rolls.map(i => i.result).sort();
  let roll_status;
  let use_die;
  let prev_use_die;

  if (zeromode) {
    use_die = sorted_rolls[0];
  } else {
    use_die = sorted_rolls[sorted_rolls.length - 1];
    if (sorted_rolls.length - 2 >= 0) {
      prev_use_die = sorted_rolls[sorted_rolls.length - 2]
    }
  }

  // 1,2,3 = failure
  if (use_die <= 3) {
    roll_status = "poor";
  } else if (use_die === 6) {
    // 6,6 - critical success
    if (prev_use_die && prev_use_die === 6) {
      roll_status = "great";
    } else {
      roll_status = "standard";
    }
  } else {
    roll_status = "limited";
  }

  return roll_status;
}

export function getResistRollStatus(rolls, zeromode = false) {

  let sorted_rolls = rolls.map(i => i.result).sort();
  let roll_status;
  let use_die;
  let prev_use_die;

  if (zeromode) {
    use_die = sorted_rolls[0];
  } else {
    use_die = sorted_rolls[sorted_rolls.length - 1];
    if (sorted_rolls.length - 2 >= 0) {
      prev_use_die = sorted_rolls[sorted_rolls.length - 2]
    }
  }

  // 1,2,3 = failure
  if (use_die <= 3) {
    roll_status = "resist";
  } else if (use_die === 6) {
    // 6,6 - critical success
    if (prev_use_die && prev_use_die === 6) {
      roll_status = "critical-resist";
    } else {
      roll_status = "resist";
    }
  } else {
    roll_status = "resist";
  }

  return [roll_status, use_die];
}

export function getPressureRollStatus(rolls, zeromode = false) {

  let sorted_rolls = rolls.map(i => i.result).sort();
  let roll_status;
  let use_die;
  let prev_use_die;

  if (zeromode) {
    use_die = sorted_rolls[0];
  } else {
    use_die = sorted_rolls[sorted_rolls.length - 1];
    if (sorted_rolls.length - 2 >= 0) {
      prev_use_die = sorted_rolls[sorted_rolls.length - 2]
    }
  }

  // 1,2,3 = failure
  if (use_die <= 3) {
    roll_status = "fast";
  } else if (use_die === 6) {
    // 6,6 - critical success
    if (prev_use_die && prev_use_die === 6) {
      roll_status = "very-slow";
    } else {
      roll_status = "slow";
    }
  } else {
    roll_status = "moderate";
  }

  return roll_status;
}

export function getEngagementRollStatus(rolls, zeromode = false) {

  let sorted_rolls = rolls.map(i => i.result).sort();
  let roll_status;
  let use_die;
  let prev_use_die;

  if (zeromode) {
    use_die = sorted_rolls[0];
  } else {
    use_die = sorted_rolls[sorted_rolls.length - 1];
    if (sorted_rolls.length - 2 >= 0) {
      prev_use_die = sorted_rolls[sorted_rolls.length - 2]
    }
  }

  // 1,2,3 = failure
  if (use_die <= 3) {
    roll_status = "engFail";
  } else if (use_die === 6) {
    // 6,6 - critical success
    if (prev_use_die && prev_use_die === 6) {
      roll_status = "engCrit";
    } else {
      roll_status = "engSuccess";
    }
  } else {
    roll_status = "engPartial";
  }

  return roll_status;
}

export function getAlchemistRollStatus(rolls, zeromode = false) {

  let sorted_rolls = rolls.map(i => i.result).sort();
  let roll_status;
  let use_die;
  let prev_use_die;

  if (zeromode) {
    use_die = sorted_rolls[0];
  } else {
    use_die = sorted_rolls[sorted_rolls.length - 1];
    if (sorted_rolls.length - 2 >= 0) {
      prev_use_die = sorted_rolls[sorted_rolls.length - 2]
    }
  }

  // 1,2,3 = failure
  if (use_die <= 3) {
    roll_status = "alcFail";
  } else if (use_die === 6) {
    // 6,6 - critical success
    if (prev_use_die && prev_use_die === 6) {
      roll_status = "alcCrit";
    } else {
      roll_status = "alcSuccess";
    }
  } else {
    roll_status = "alcPartial";
  }

  return roll_status;
}

/**
 * Call a Roll popup.
 */
export async function simpleRollPopup() {

  new Dialog({
    title: `Fortune Roll`,
    content: `
      <h2>${game.i18n.localize("BITD.FortuneRoll")}</h2>
      <p>${game.i18n.localize("BITD.RollTokenDescription")}</p>
      <form>
        <div class="form-group">
          <label>${game.i18n.localize("BITD.RollNumberOfDice")}:</label>
          <select id="qty" name="qty">
            ${Array(11).fill().map((item, i) => `<option value="${i}">${i}d</option>`).join('')}
          </select>
        </div>
      </form>
    `,
    buttons: {
      yes: {
        icon: "<i class='fas fa-check'></i>",
        label: game.i18n.localize('Roll'),
        callback: async (html) => {
          let diceQty = html.find('[name="qty"]')[0].value;
          await bobRoll(diceQty, "Fortune!", "", "");
        },
      },
      no: {
        icon: "<i class='fas fa-times'></i>",
        label: game.i18n.localize('Cancel'),
      },
    },
    default: "yes"
  }).render(true);
}
