/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  /* MODULE 7.4 - making a new class Product */

  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.initAccordion();
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

      console.log('new Product', thisProduct);
    }

    // module 7.5
    initAccordion() {

      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */

      const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

      /* START: add event listener to clickable trigger on event click */

      clickableTrigger.addEventListener('click', function (event) {

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
  }

  const app = {
    initMenu: function () {

      const thisApp = this;

      console.log('thisApp.data', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
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
      thisApp.initMenu();
    },
    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },
  };
  app.init();
}
