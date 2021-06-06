import { settings, select } from '../settings.js';
// MODULE 8.1 - amountWidget

class AmountWidget {
  constructor(element) {
    const thisWidget = this;

    // wywołania w konstruktorze

    thisWidget.getElements(element);
    thisWidget.setValue(thisWidget.input.value || settings.amountWidget.defaultValue);
    thisWidget.initActions();

  }

  getElements(element) {
    const thisWidget = this;

    // referencje do odpowiednich elementów z daną klasą
    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  // funkcja pośrednik
  setValue(value) {

    const thisWidget = this;

    const newValue = parseInt(value);

    /* TODO: Add validation */

    // sprawdza czy wpisana wartosc jest inna niz obecnie, oraz czy nie niest równa null
    if (thisWidget.value !== newValue && !isNaN(newValue) && settings.amountWidget.defaultMin <= newValue && settings.amountWidget.defaultMax >= newValue) {

      thisWidget.value = newValue;

      thisWidget.announce();

      thisWidget.input.value = thisWidget.value;

    }
  }

  // MODUL 8.1
  announce() {
    const thisWidget = this;

    /* MODUL 8.5 bąbelkowanie propagacja - przekazywanie emitowania eventu na rodzica dziadka itd */
    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }

  // MODUL 8.1
  initActions() {
    const thisWidget = this;


    // zmiana wartosci
    thisWidget.input.addEventListener('change', function () {
      thisWidget.setValue(thisWidget.input.value);
    });

    // przycisk odejmujący
    thisWidget.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

    // przycik dodający
    thisWidget.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
}

export default AmountWidget;
