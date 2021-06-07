import { settings, select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

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
      //products: [],
      products: thisCart.products.map(product => product.getData())
    };

    /*for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }*/

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

export default Cart;
