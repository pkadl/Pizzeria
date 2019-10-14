/* eslint-disable linebreak-style */
import utils from '../utils.js';
import {select, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Product{
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
    console.log('new product:', thisProduct);
  }
  renderInMenu() {
    const thisProduct = this;
    /* generate HTML */
    const generatedHTML = templates.menuProduct(thisProduct.data);
    /* create element */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    /* find wrapper */
    const menuContainer = document.querySelector(select.containerOf.menu);
    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }
  getElements() {
    const thisProduct = this;
    
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      
  }
  initAccordion() {
    const thisProduct = this;      
    /* START: click event listener to trigger */
    thisProduct.accordionTrigger.addEventListener('click', function() {
      /* prevent default action for event */
      event.preventDefault();
      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle('active');
      /* find all active products */
      const activeProducts = document.querySelectorAll('article.active');
      /* START LOOP: for each active product */
      for(let activeProduct of activeProducts) {
        /* START: if the active product isn't the element of thisProduct */
        if (activeProduct != thisProduct.element) {
          /* remove class active for the active product */
          activeProduct.classList.remove('active');
          /* END: if the active product isn't the element of thisProduct*/
        }
        /* END LOOP: for each active product */
      }
      /* END: click event listener to trigger */
    });
  }
  initOrderForm() {
    const thisProduct = this;   
    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
      
    for(let input of thisProduct.formInputs) {
      input.addEventListener('change', function() {
        thisProduct.processOrder();
      });
    }
      
    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  } 

  processOrder() {
    const thisProduct = this;  
    const formData = utils.serializeFormToObject(thisProduct.form);
    /* save default price from data.price */
    thisProduct.params = {};
    var price = thisProduct.data.price;
    /* START LOOP: for each param */
    for(let paramId in thisProduct.data.params) {
      /* START LOOP: for each option */
      const param = thisProduct.data.params[paramId];
      for(let optionId in param.options) {
        const option = param.options[optionId];
        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
        /* if it's not default raise the price */
        if(optionSelected && !option.default) {
          price = price + option.price;
        }
        /* if it's default reduce the price */
        else if (!optionSelected && option.default) {
          price = price - option.price;
        }
        let selector = '.' + paramId + '-' + optionId;
        let imagesSelect = thisProduct.imageWrapper.querySelectorAll(selector);
        if(optionSelected) {
          if(!thisProduct.params[paramId]) {
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            }; 
          }
          thisProduct.params[paramId].options[optionId] = option.label;
          for(let image of imagesSelect) {
            image.classList.add('active');
          }
        }
        /* if it's default reduce the price */
        else {
          for (let image of imagesSelect) {
            image.classList.remove('active');
          }
        } 
        /* END LOOP: for each option */
      }
      /* END LOOP: for each param */
    }
    /* multiply price by amount */
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    /* set the contents of thisProduct.priceElem to be the value of variable price */
    thisProduct.priceElem.innerHTML = thisProduct.price;
  }
  initAmountWidget() {
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(event) {
      event.preventDefault();
      thisProduct.processOrder();
    });
  }
  addToCart() {
    const thisProduct = this;
    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;
    // app.cart.add(thisProduct);
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });
    thisProduct.element.dispatchEvent(event);
  }
}
export default Product;