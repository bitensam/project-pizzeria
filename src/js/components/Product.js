import { select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';


/* MODULE 7.4 - making a new class Product */

class Product {
  constructor(id, data) {
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
  }

  // module 7.5
  renderInMenu() {
    const thisProduct = this;

    /* GENERATE HTML BASED ON TEMPLATE */

    const generatedHTML = templates.menuProduct(thisProduct.data);

    /* CREATE ELEMENT USING UTILS.CREATEELEMENTFROMHTML */

    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* FIND MENU CONTAINER */

    const menuContainer = document.querySelector(select.containerOf.menu);

    /* ADD ELEMENT TO MENU */

    menuContainer.appendChild(thisProduct.element);

  }

  // module 7.6
  getElements() {
    const thisProduct = this;
    // referencje do odpowiednich elementów z daną klasą
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }
  // module 7.5
  initAccordion() {

    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) */

    // module 7.6 because of accordionTrigger const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

    /* START: add event listener to clickable trigger on event click */
    thisProduct.accordionTrigger.addEventListener('click', function (event) {
      // module 7.6 clickableTrigger.addEventListener('click', function (event) {


      /* prevent default action for event */

      event.preventDefault();

      /* find active product (product that has active class) */

      const activeProduct = document.querySelector(select.all.menuProductsActive);

      /* if there is active product and it's not thisProduct.element, remove class active from it */

      if (activeProduct && activeProduct !== thisProduct.element) {
        activeProduct.classList.remove('active');

      }

      /* toggle active class on thisProduct.element */

      thisProduct.element.classList.toggle('active');
    });

  }
  // MODULE 7.6
  initOrderForm() {
    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  // MODULE 8.1 WIDGET METHOD
  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

    thisProduct.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }

  // MODULE 7.6
  processOrder() {
    const thisProduct = this;

    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);

    // set price to default price
    let price = thisProduct.data.price;

    // for every category (param)...
    for (let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];


      /* EX FROM MODULE 7.6 */

      // for every option in this category
      for (let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];


        // check if there is param with a name of paramId in formData and if it includes optionId
        if (formData[paramId] && formData[paramId].includes(optionId)) {
          // check if options are deafult
          if (!option.default === true) {
            // add option price to default price
            price += option.price;
          }

        } else {

          // check if options aren't deafult

          if (option.default === true) {

            // subtract option price from default price

            price -= option.price;
          }
        }

        // find image with class: .paramId-optionId in thisProduct.imageWrapper
        //const activeImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
        const activeImage = thisProduct.imageWrapper.querySelector(`.${paramId}-${optionId}`);

        // check if was found, if yes check optionId
        if (activeImage) {

          // If yes show the activeImage
          if (formData[paramId] && formData[paramId].includes(optionId)) {

            activeImage.classList.add(classNames.menuProduct.imageVisible);

            //  if not hide the activeImage
          } else {
            activeImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }

    // module 8.4 - assign priceSingle to price

    thisProduct.priceSingle = price;

    // multiply price by amount

    price *= thisProduct.amountWidget.value;

    // update calculated price in the HTML

    thisProduct.priceElem.innerHTML = price;
  }

  // MODULE 8.4 - ADD NEW PRODUCT OBJECT PREPARED TO GET TO THE CART
  prepareCartProduct() {
    const thisProduct = this;

    // this is product object with only nescesery info to get to cart
    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.priceSingle * thisProduct.amountWidget.value,
      params: thisProduct.prepareCartProductParams(),
    };

    return productSummary;
  }

  // module 8.4 ćwiecznie
  prepareCartProductParams() {

    const thisProduct = this;

    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);

    // zdeklarowanie obiektu params
    const params = {};

    // for every category (param)...
    for (let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];

      params[paramId] = {
        label: param.label,
        options: {},
      };
      // for every option in this category
      for (let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        // check if there is param with a name of paramId in formData and if it includes optionId
        if (formData[paramId] && formData[paramId].includes(optionId)) {

          params[paramId].options[optionId] = option.label;

        }
      }
    }
    return params;
  }

  // MODULE 8.4 - ADD PRODUCT TO CART
  addToCart() {
    const thisProduct = this;

    // app.cart.add(thisProduct.prepareCartProduct());

    //thisProduct.name = thisProduct.data.name;
    //thisProduct.amount = thisProduct.amountWidget.value;

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      }
    });

    thisProduct.element.dispatchEvent(event);
  }
}

export default Product;
