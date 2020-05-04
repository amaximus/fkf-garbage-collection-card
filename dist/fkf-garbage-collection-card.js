class FKFGarbageCollectionCard extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  _getAttributes(hass, filter1, dmode) {
    var indays = new Array();
    var gday = new Array();
    var gdate = new Array();
    var garbage = new Array();
    var icon1 = new Array();
    var icon2 = new Array();
    var gcollectionobjarray = [];
    var items;
    var current;
    var alerted = '';

    function _filterName(stateObj, pattern) {
      let parts;
      let attr_id;
      let attribute;

      if (typeof (pattern) === "object") {
        parts = pattern["key"].split(".");
        attribute = pattern["key"];
      } else {
        parts = pattern.split(".");
        attribute = pattern;
      }
      attr_id = parts[2];

      if (attr_id.indexOf('*') === -1) {
        return stateObj == attribute;
      }
      const regEx = new RegExp(`^${attribute.replace(/\*/g, '.*')}$`, 'i');
      return stateObj.search(regEx) === 0;
    }
 
    var supportedItems = 5;
    var filters1 = new Array();
    for (var k=0; k < supportedItems; k++) {
      filters1[k*4+0] = {key: "sensor."+ filter1 + ".day" + k};
      filters1[k*4+1] = {key: "sensor."+ filter1 + ".date" + k};
      filters1[k*4+2] = {key: "sensor."+ filter1 + ".garbage" + k};
      filters1[k*4+3] = {key: "sensor."+ filter1 + ".in" + k};
    }
    filters1[supportedItems*4+0] = {key: "sensor." + filter1 + ".items"};
    filters1[supportedItems*4+1] = {key: "sensor." + filter1 + ".current"};

    const attributes = new Map();
    filters1.forEach((filter) => {
      const filters = [];

      filters.push(stateObj => _filterName(stateObj, filter));

      Object.keys(hass.states).sort().forEach(key => {
        Object.keys(hass.states[key].attributes).sort().forEach(attr_key => {
          if (filters.every(filterFunc => filterFunc(`${key}.${attr_key}`))) {
            attributes.set(`${key}.${attr_key}`, {
              value: `${hass.states[key].attributes[attr_key]} ${filter.unit||''}`.trim(),
            });
          }  
        });
      });
    });

    var attr = Array.from(attributes.keys());

    const translationLocal = "/local/community/fkf-garbage-collection-card/" + hass.language + ".json";
    var rawFile = new XMLHttpRequest();
   // rawFile.responseType = 'json';
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", translationLocal, false);
    rawFile.send(null);
    var translationJSONobj;
    if ( rawFile.status === 200 ) {
      translationJSONobj = JSON.parse(rawFile.responseText);
    }

    var re = /\d$/;
    attr.forEach(key => {
      var newkey = key.split('.')[2];

      if ( re.test(newkey) ) {
        var idx = newkey[newkey.length - 1];
        var name = newkey.slice(0, -1);
        switch (name) {
          case 'in':
            indays[idx]="(" + attributes.get(key).value + " days)";
            if ( rawFile.status === 200 ) {
              if ( typeof translationJSONobj != "undefined" ) {
                if ( typeof translationJSONobj.garbage["days"] != "undefined" ) {
                  indays[idx] = "(" + attributes.get(key).value + " " + translationJSONobj.garbage["days"] + ")";
                }
              }
            }
            break;
          case 'day':
            gday[idx]=attributes.get(key).value;
            if ( rawFile.status === 200 ) {
              if ( typeof translationJSONobj != "undefined" ) {
                if ( typeof translationJSONobj.weekday[gday[idx]] != "undefined" ) {
                  gday[idx] = translationJSONobj.weekday[attributes.get(key).value];
                }
              }
            }
            break;
          case 'garbage':
            garbage[idx]=attributes.get(key).value.toLowerCase();

            if (attributes.get(key).value.toLowerCase() == "selective" || 
                attributes.get(key).value.toLowerCase() == "communal") {
                if ( rawFile.status === 200 ) {
                  if ( typeof translationJSONobj != "undefined" ) {
                    if (typeof translationJSONobj.garbage[attributes.get(key).value.toLowerCase()] != "undefined") {
                      garbage[idx]=translationJSONobj.garbage[attributes.get(key).value.toLowerCase()]
                    }
                  }
                }
                if (attributes.get(key).value.toLowerCase() == "selective") {
                  icon1[idx]='<iron-icon icon="mdi:recycle" style="--iron-icon-fill-color: green;">'
                  icon2[idx]=""
                } else if (attributes.get(key).value.toLowerCase() == "communal") {
                  if ( dmode ) {
                    icon1[idx]='<iron-icon icon="mdi:trash-can-outline" style="--iron-icon-fill-color: white;">'
                  } else {
                    icon1[idx]='<iron-icon icon="mdi:trash-can-outline" style="--iron-icon-fill-color: black;">'
                  }
                  icon2[idx]=""
                }
            } else if (attributes.get(key).value.toLowerCase() == "both") {
              if ( dmode ) {
                icon1[idx]='<iron-icon icon="mdi:trash-can-outline" style="--iron-icon-fill-color: white;">'
              } else {
                icon1[idx]='<iron-icon icon="mdi:trash-can-outline" style="--iron-icon-fill-color: black;">'
              }
              icon2[idx]='<iron-icon icon="mdi:recycle" style="--iron-icon-fill-color: green;">'
              garbage[idx]="communal, selective"
              if ( rawFile.status === 200 ) {
                if ( typeof translationJSONobj != "undefined" ) {
                  if ( typeof translationJSONobj.garbage["communal"] != "undefined" &&
                       typeof translationJSONobj.garbage["selective"] != "undefined") {
                    garbage[idx]=translationJSONobj.garbage["communal"] + ", " + translationJSONobj.garbage["selective"]
                  }
                }
              }
            }
            break;
          case 'date':
            gdate[idx]=attributes.get(key).value;
            break;
        }
      } else if ( newkey == "items") {
        items = attributes.get(key).value;
      } else if ( newkey == "current") {
        current = attributes.get(key).value;
      }
    });

    if ( items > 0 ) {
      for (var i=0; i < items; i++) {
        if ( gdate[i] ) {
          alerted = '';
          if ( indays[i] < 2 ) {
            alerted='alerted_1';
          }
          if ( indays[i] < 1 ) {
            alerted='alerted';
          }

          gcollectionobjarray.push({
            key: gdate[i],
            indays: indays[i],
            garbage: garbage[i],
            gday: gday[i],
            icon1: icon1[i],
            icon2: icon2[i],
            items: items,
            current: current,
            alerted: alerted
          });
        }
      }
    } else {
      gcollectionobjarray.push({
        key: 'No data',
        indays: '',
        garbage: '',
        gday: '',
        icon1: '',
        icon2: '',
        items: 0,
        current: "not_current",
        alerted: ''
      }); 
    }
    return Array.from(gcollectionobjarray.values());
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define an entity');
    }
    config.filter

    const root = this.shadowRoot;
    if (root.lastChild) root.removeChild(root.lastChild);

    const cardConfig = Object.assign({}, config);
    const card = document.createElement('ha-card');
    const content = document.createElement('div');
    const style = document.createElement('style');
    let icon_size = config.icon_size;
    if (typeof icon_size === "undefined") icon_size="25px"
    let due_color = config.due_color;
    if (typeof due_color === "undefined") due_color="red"
    let due_1_color = config.due_1_color;
    if (typeof due_1_color === "undefined") due_1_color=due_color
    let title = "";
    if (typeof config.title != "undefined") title=config.title
    card.header = title;

    style.textContent = `
      table {
        width: 98%;
        padding: 0px;
        border: none;
        padding-left: 20px;
      }
      .tdicon {
        width: ${icon_size};
      }
      .garbage {
        text-align: right;
        margin-right: 0px;
      }
      .day_date {
        text-align: left;
      }

      .alerted {
        --iron-icon-fill-color: ${due_color};
        color: ${due_color};
      }
      .alerted_1 {
        --iron-icon-fill-color: ${due_1_color};
        color: ${due_1_color};
      }
      tbody tr:nth-child(odd) .not_current {
        background-color: var(--secondary-background-color);
      }
      tbody tr:nth-child(even) .not_current {
        background-color: var(--paper-card-background-color);
      }
      iron-icon {
        --iron-icon-height: ${icon_size};
        --iron-icon-width: ${icon_size};
      }
    `;

    content.innerHTML = `
      <table>
        <tbody id='attributes'>
        </tbody>
      </table>
    `;
    card.appendChild(style);
    card.appendChild(content);
    root.appendChild(card)
    this._config = cardConfig;
  }

  _updateContent(element, attributes, hdate, hwday, hdays, htext, hcard, nonly) {
    if ( nonly === true ) {
      element.innerHTML = `
        ${attributes.map((attribute) => `
          <tr>
          <td class="tdicon">${attribute.icon1}</td>
          <td>${attribute.icon2}</td>
          <td class="${attribute.alerted} ${attribute.current} day_date">
              ${hdate === false ? `${attribute.key}` : ''}
              ${hwday === false ? `${attribute.gday}` : ''}
              ${hdays === false ? `${attribute.indays}` : ''}
          </td>
          <td class="${attribute.alerted} ${attribute.current} garbage">
              ${htext === false ? `${attribute.garbage}` : ''}
          </td>
         </tr>
      `)[0]}`;
    } else {
      element.innerHTML = `
        ${attributes.map((attribute) => `
          <tr>
          <td class="tdicon">${attribute.icon1}</td>
          <td>${attribute.icon2}</td>
          <td class="${attribute.alerted} ${attribute.current} day_date">
              ${hdate === false ? `${attribute.key}` : ''}
              ${hwday === false ? `${attribute.gday}` : ''}
              ${hdays === false ? `${attribute.indays}` : ''}
          </td>
          <td class="${attribute.alerted} ${attribute.current} garbage">
              ${htext === false ? `${attribute.garbage}` : ''}
          </td>
          </tr>
       `).join('')}
      `;
    }

    this.style.display = hcard ? "none" : "block";
  }

  set hass(hass) {
    const config = this._config;
    const root = this.shadowRoot;

    let hide_date = false;
    if (typeof config.hide_date != "undefined") hide_date=config.hide_date
    let hide_wday = false;
    if (typeof config.hide_wday != "undefined") hide_wday=config.hide_wday
    let hide_days = false;
    if (typeof config.hide_days != "undefined") hide_days=config.hide_days
    let hide_text = false;
    if (typeof config.hide_text != "undefined") hide_text=config.hide_text
    let next_only = false;
    if (typeof config.next_only != "undefined") next_only=config.next_only
    let hide_card = false;
    let hide_before = -1;
    if (typeof config.hide_before != "undefined") hide_before=config.hide_before
    let dark_mode = false;
    if (typeof config.dark_mode != "undefined") dark_mode=config.dark_mode

    let attributes = this._getAttributes(hass, config.entity.split(".")[1], dark_mode);

    if (hide_before>-1) {
      let iDays = parseInt(attributes[0].indays,10);
      if (iDays > hide_before) {
        hide_card = true;
      }
    }

    this._stateObj = this._config.entity in hass.states ? hass.states[this._config.entity] : null;

    this._updateContent(root.getElementById('attributes'), attributes, hide_date, hide_wday, hide_days, hide_text, hide_card, next_only);
  }

  getCardSize() {
    return 3;
  }
}

customElements.define('fkf-garbage-collection-card', FKFGarbageCollectionCard);
