/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },

    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

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
          const activeImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);

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

      app.cart.add(thisProduct.prepareCartProduct());
    }
  }

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

  // MODULE 8.3
  class Cart {
    constructor(element) {

      const thisCart = this;
      thisCart.products = [];

      // wywołania metod w konstruktorze
      thisCart.getElements(element);
      thisCart.initActions();

    }

    getElements(element) {
      const thisCart = this;

      thisCart.dom = {};

      // referencje do odpowiednich elementów

      thisCart.dom.wrapper = element;

      thisCart.dom.toggleTrigger = element.querySelector(select.cart.toggleTrigger);

      thisCart.dom.productList = element.querySelector(select.cart.productList);

      // 8.5 Wyświetlanie aktualnych sum w koszyku

      thisCart.dom.deliveryFee = element.querySelector(select.cart.deliveryFee);

      thisCart.dom.subTotalPrice = element.querySelector(select.cart.subtotalPrice);

      thisCart.dom.totalPrice = element.querySelectorAll(select.cart.totalPrice);

      thisCart.dom.totalNumber = element.querySelector(select.cart.totalNumber);

      // 8.9
      thisCart.dom.form = element.querySelector(select.cart.form);

      thisCart.dom.phone = element.querySelector(select.cart.phone);

      thisCart.dom.address = element.querySelector(select.cart.address);
    }

    initActions() {

      const thisCart = this;

      // funkcja powodująca, ze po kliknieciu rozwija się okienko koszyka

      thisCart.dom.toggleTrigger.addEventListener('click', function () {

        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      // 8.5 nasłuchiwacz dla widgetu zmianu ilosci w koszyku

      thisCart.dom.productList.addEventListener('updated', function () {
        thisCart.update();
      });

      // 8.6
      thisCart.dom.productList.addEventListener('remove', function (event) {
        thisCart.remove(event.detail.cartProduct);
      });

      // 8.9

      thisCart.dom.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisCart.sendOrder();
      });
    }

    // MODULE 8.9 - SEND ORDER METHOD

    sendOrder() {
      const thisCart = this;

      // ENDPOINT ADRESS http://localhost:3131/orders
      const url = settings.db.url + '/' + settings.db.orders;

      const payload = {
        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subTotalPrice: thisCart.subTotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.deliveryFee,
        products: [],
      };

      for (let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }

      // wysyłka danych
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      fetch(url, options);

    }

    // MODULE 8.4 - ADD PRODUCT TO CART

    add(menuProduct) {

      const thisCart = this;

      const generatedHTML = templates.cartProduct(menuProduct);

      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      thisCart.dom.productList.appendChild(generatedDOM);

      // MODULE 8.5 ADD INFO ABOUT PRODUCT ADDED TO CART IN PRODUCT ARRAY

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

      thisCart.update();

    }

    // 8.6 ZADANIE
    remove(CartProduct) {
      const thisCart = this;

      const indexOfProduct = thisCart.products.indexOf(CartProduct);

      thisCart.products.splice(indexOfProduct, 1);

      CartProduct.dom.wrapper.remove();

      thisCart.update();

      console.log('dzialam2');
    }


    // MODULE 8.5 EX. SUMOWANIE KOSZYKA

    update() {
      const thisCart = this;

      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

      console.log('deliveryFee', thisCart.deliveryFee);

      thisCart.totalNumber = 0;

      thisCart.subTotalPrice = 0;

      // LOOP START: increasing totalNumber of products and subTotalPrice */
      for (let product of thisCart.products) {

        thisCart.totalNumber = thisCart.totalNumber + product.amount;

        thisCart.subTotalPrice = thisCart.subTotalPrice + product.price;

      }
      // END LOOP

      if (!thisCart.totalNumber == 0) {

        thisCart.totalPrice = thisCart.subTotalPrice + thisCart.deliveryFee;

        thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;


      } else if (thisCart.totalNumber == 0) {
        thisCart.totalPrice = 0;
        thisCart.dom.deliveryFee.innerHTML = 0;

      }


      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      thisCart.dom.subTotalPrice.innerHTML = thisCart.subTotalPrice;

      for (let priceSum of thisCart.dom.totalPrice) {
        priceSum.innerHTML = thisCart.totalPrice;
      }


      console.log('totalNumber:', thisCart.totalNumber);
      console.log('subTotalPrice:', thisCart.subTotalPrice);
    }

  }

  // MODULE 8.5 CREATE CLASS CartProduct

  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;

      /* Zapisanie wszystkich właściwośći z argumentu menuProduct i przypisanie do pojedyńczych właściwości */

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = menuProduct.params;

      // wywyołanie metody getElements z argumentem element

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();


    }

    // MODULE 8.5 EX.2
    getElements(element) {
      const thisCartProduct = this;

      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;

      thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);

    }

    initAmountWidget() {
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }

    // MODULE 8.9 - getData

    getData() {
      const thisCartProduct = this;

      const data = {
        id: thisCartProduct.id,
        amount: thisCartProduct.amount,
        price: thisCartProduct.price,
        priceSingle: thisCartProduct.priceSingle,
        name: thisCartProduct.name,
        params: thisCartProduct.params,
      };
      return data;
    }

    // MODULE 8.6 - REMOVE FROM CART

    remove() {
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        }

      });
      console.log('dzialam');
      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    // 8.6

    initActions() {
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function (event) {
        event.preventDefault();
      });

      thisCartProduct.dom.remove.addEventListener('click', function (event) {
        event.preventDefault();

        thisCartProduct.remove();
      });


    }
  }

  const app = {

    initMenu: function () {

      const thisApp = this;

      for (let productData in thisApp.data.products) {
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },

    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initCart();
    },

    initData: function () {
      const thisApp = this;

      // MODULE 8.8 API
      thisApp.data = {};

      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
        .then(function (rawResponse) {
          return rawResponse.json();
        })
        .then(function (parsedResponse) {
          console.log('parsedResponse:', parsedResponse);

          //  save parsedResponse as thisApp.data.products

          thisApp.data.products = parsedResponse;

          // execute initMenu method

          thisApp.initMenu();
        });

      console.log('thisApp.data', JSON.stringify(thisApp.data));
    },

    // MODULE 8.1 - init of cart instance

    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);

      thisApp.cart = new Cart(cartElem);
    }

  };

  app.init();

}
