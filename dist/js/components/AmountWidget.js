import { settings, select } from '../settings.js';
import BaseWidget from './BaseWidget.js';
// MODULE 8.1 - amountWidget

class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this;

    // wywołania w konstruktorze

    thisWidget.getElements(element);
    //thisWidget.setValue(thisWidget.dom.input.value || settings.amountWidget.defaultValue);
    thisWidget.initActions();

  }

  getElements() {
    const thisWidget = this;

    // referencje do odpowiednich elementów z daną klasą
    //thisWidget.dom.wrapper = element;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(value) {
    return !isNaN(value)
      && settings.amountWidget.defaultMin <= value
      && settings.amountWidget.defaultMax >= value;
  }

  renderValue() {
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.correctValue;
  }

  // MODUL 8.1
  initActions() {
    const thisWidget = this;


    // zmiana wartosci
    thisWidget.dom.input.addEventListener('change', function () {
      thisWidget.setValue(thisWidget.dom.input.value);
    });

    // przycisk odejmujący
    thisWidget.dom.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.correctValue - 1);
    });

    // przycik dodający
    thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.correctValue + 1);
    });
  }
}

export default AmountWidget;
