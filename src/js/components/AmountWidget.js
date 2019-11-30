/* eslint-disable linebreak-style */
import {settings, select, classNames} from '../settings.js';
import BaseWidget from './BaseWidget.js';
class AmountWidget extends BaseWidget {
  constructor(element, wrap) {
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this;
    thisWidget.getElements(element);
    thisWidget.initActions(wrap);
  }
  getElements() {
    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
    
  }

  isValid(value) {
    return !isNaN(value)
    && value >= settings.amountWidget.defaultMin 
    && value <= settings.amountWidget.defaultMax;
  }
  renderValue() {
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;
    if(thisWidget.dom.input.name == 'hours') {
      
      thisWidget.dom.input.addEventListener('change', function() {
        
        thisWidget.value = thisWidget.setValue(thisWidget.value);});}

    else {
      thisWidget.dom.input.addEventListener('change', function() {
        
        thisWidget.value = thisWidget.dom.input.value;}
      );}
    if(thisWidget.dom.input.name == 'hours') {

      thisWidget.dom.linkDecrease.addEventListener('click', function(event) {
        
        if(document.querySelector(classNames.booking.tableSelected) != 'null' || document.querySelector(classNames.booking.tableSelected) != 'undefined') { 
          event.preventDefault();
          thisWidget.setValue(thisWidget.value - 0.5);}
        else {alert('Najpierw wybierz stolik');}
      });}else{
    
      thisWidget.dom.linkDecrease.addEventListener('click', function(event) {    
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });}
    
    if(thisWidget.dom.input.name == 'hours') {
      thisWidget.dom.linkIncrease.addEventListener('click', function(event) {     
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 0.5);
      }
      );
    } else {
      thisWidget.dom.linkIncrease.addEventListener('click', function(event) {     
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    } 
  }}
export default AmountWidget;