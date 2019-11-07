/* eslint-disable linebreak-style */
import {select, classNames, templates, settings} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import { utils } from '../utils.js';
class Booking {
  constructor(wrap) {
    const thisBooking = this;
    thisBooking.render(wrap);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.initForm();
  }
  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate); 
    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        startDateParam,
        endDateParam,
        settings.db.notRepeatParam,
      ],
      eventsRepeat: [
        endDateParam,
        settings.db.repeatParam,
      ]
    };

    
    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking  
                                     + '?' + params.booking.join('&'),     
      eventsCurrent: settings.db.url + '/' + settings.db.event    
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event    
                                     + '?' + params.eventsRepeat.join('&'),
    };
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }
  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for(let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat) {
      if(item.repeat == 'daily') {
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
     
        }
      }
    }
    thisBooking.updateDOM();
  }
  makeBooked(date, hour, duration, table) {
    const thisBooking = this;
    if(typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);
    
    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
    
  }
  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    
    let allAvailable = false;

    if (typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
        typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    
    for(let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);

      if(!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }
      
      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
    for(let table of thisBooking.dom.tables) {
      if(table.classList.contains('booked') == true) {
        table.classList.add('blocked');
      }
      else {
        table.classList.remove('blocked');
        table.classList.remove('choice');
      }
    }

  }
  sendBooking() {
    const thisBooking = this;
    const tableId = parseInt(thisBooking.dom.wrapper.querySelector('.choice').getAttribute(settings.booking.tableIdAttribute));
    console.log('tableId', tableId);
    const url = settings.db.url + '/' + settings.db.booking;
    console.log('url', url);
    const payload = {
      date: thisBooking.date,
      hour: utils.numberToHour(thisBooking.hour),
      table: tableId,
      repeat: false,
      duration: thisBooking.hoursAmount.value,
      ppl: thisBooking.peopleAmount.value,
      starters: [],
      address: thisBooking.dom.address.value,
      phone: thisBooking.dom.phone.value
    };
    const startersList = document.getElementsByName('starter');
    for(let starter of startersList) {
      if(starter.checked == true) {
        payload.starters.push(starter.value);
        starter.checked = false;
      }
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    //}
    console.log('payload', payload);
    return fetch(url, options) 
      .then(function(response) {
        return response.json();
      }) 
      .then(function(parsedResponse) {
        console.log('parsedResponse:', parsedResponse);
      });
  }
  render(wrap) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = wrap;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
  }
  initWidgets() {
    const thisBooking = this;  
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
  }
  initForm(){
    const thisBooking = this;
    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    for(let table of thisBooking.dom.tables) {
      table.addEventListener('click', function() {
        if(!table.classList.contains('blocked')) {
          table.classList.toggle('booked');
          table.classList.toggle('choice');
        } else {
          alert('Ten stolik jest już zarezerwowany');
        }
      });
    }
    

    thisBooking.dom.wrapper.addEventListener('submit', function() {
      event.preventDefault();
      const tableChoiceChecker = thisBooking.dom.wrapper.querySelector('.choice');
    
      if(tableChoiceChecker == null) {
        alert('wybierz stolik');
      }
      else if (thisBooking.dom.address.value == '') {
        alert('uzupełnij adres');
      }
      else if (thisBooking.dom.phone.value == '') {
        alert('uzupełnij telefon');
      }
      else {
        thisBooking.sendBooking()
          .then(function() {
            thisBooking.getData();
          }); 
      } 
    }); 
  }
}
export default Booking;