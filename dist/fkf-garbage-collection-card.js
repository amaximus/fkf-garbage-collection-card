class FKFGarbageCollectionCard extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  _getAttributes(hass, filter1, oneicon) {
    var indays = new Array();
    var gday = new Array();
    var gdate = new Array();
    var garbage = new Array();
    var icon1 = new Array();
    var icon2 = new Array();
    var icon3 = new Array();
    var gcollectionobjarray = [];
    var items;
    var current;
    var alerted = '';
    const icon = { "communal": '<ha-icon icon="mdi:trash-can-outline" style="color: var(--paper-item-icon-color);">',
                   "green": '<ha-icon icon="mdi:leaf" style="color: green;">',
                   "selective": '<ha-icon icon="mdi:recycle" style="color: green;">'}

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

    var re = /\d$/;
    attr.forEach(key => {
      var newkey = key.split('.')[2];

      if ( re.test(newkey) ) {
        var idx = newkey[newkey.length - 1];
        var name = newkey.slice(0, -1);
        switch (name) {
          case 'in':
            indays[idx]="(" + attributes.get(key).value + " days)";
            if ( typeof this.translationJSONobj != "undefined" ) {
              if ( typeof this.translationJSONobj.garbage["days"] != "undefined" ) {
                indays[idx] = "(" + attributes.get(key).value + " " + this.translationJSONobj.garbage["days"] + ")";
              }
            }
            break;
          case 'day':
            gday[idx]=attributes.get(key).value;
            if ( typeof this.translationJSONobj != "undefined" ) {
              if ( typeof this.translationJSONobj.weekday[gday[idx]] != "undefined" ) {
                gday[idx] = this.translationJSONobj.weekday[attributes.get(key).value];
              }
            }
            break;
          case 'garbage':
            garbage[idx] = attributes.get(key).value.toLowerCase();

            icon1[idx]=""
            icon2[idx]=""
            icon3[idx]=""
            var res = attributes.get(key).value.toLowerCase().split("_");
            if ( oneicon ) {
              let icontype = ""
              if ( res.indexOf("green") >= 0 ) {
                icontype = "green"
              } else if ( res.indexOf("selective") >= 0 ) {
                icontype = "selective"
              } else if ( res.indexOf("communal") >= 0 ) {
                icontype = "communal"
              }
              icon1[idx]=icon[icontype]
              if ( typeof this.translationJSONobj != "undefined" ) {
                if ( typeof this.translationJSONobj.garbage[icontype] != "undefined" ) {
                  garbage[idx] = this.translationJSONobj.garbage[icontype]
                }
              }
            } else {
              var i = 0;
              let garbagestr = ""
              for (const value of res) {
                if ( i % 3 === 0 ) {
                  icon1[idx]=icon[value]
                } else if ( i % 3 === 1 ) {
                  icon2[idx]=icon[value]
                } else if ( i % 3 === 2 ) {
                  icon3[idx]=icon[value]
                }
                if ( typeof this.translationJSONobj != "undefined" ) {
                  if ( typeof this.translationJSONobj.garbage[value] != "undefined" ) {
                    garbagestr += this.translationJSONobj.garbage[value] + ", "
                  }
                } else {
                  garbagestr = garbage[idx] + ", "
                }
                i+=1;
              }
              if ( garbagestr.length > 2 ) {
                garbage[idx] = garbagestr.slice(0, -2);
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

    var ind='';
    if ( items > 0 ) {
      for (var i=0; i < items; i++) {
        if ( gdate[i] ) {
          alerted = '';
          ind=indays[i].match(/\d+/)
          if ( ind < 2 ) {
            alerted='alerted_1';
          }
          if ( ind < 1 ) {
            alerted='alerted';
          }

          gcollectionobjarray.push({
            key: gdate[i],
            indays: indays[i],
            garbage: garbage[i],
            gday: gday[i],
            icon1: icon1[i],
            icon2: icon2[i],
            icon3: icon3[i],
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
        icon3: '',
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
    if (typeof icon_size === "undefined") icon_size="24px"
    let due_color = config.due_color;
    if (typeof due_color === "undefined") due_color="red"
    let due_1_color = config.due_1_color;
    if (typeof due_1_color === "undefined") due_1_color=due_color
    let title = "";
    if (typeof config.title != "undefined") title=config.title
    card.header = title;

    let install_path = "/hacsfiles/fkf-garbage-collection-card/"
    if (typeof config.install_path != "undefined") install_path=config.install_path

    this.llocale = window.navigator.userLanguage || window.navigator.language;
    this.translationJSONobj = "undefined";
    const translationLocal = install_path + this.llocale.substring(0,2) + ".json";
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", translationLocal, false);
    rawFile.send(null);
    if ( rawFile.status == 200 ) {
        this.translationJSONobj = JSON.parse(rawFile.responseText);
    }

    style.textContent = `
      table {
        width: 99%;
        padding: 0px;
        border: none;
        padding-left: 21px;
      }
      td {
        padding: 10px;
      }
      .tdicon {
        width: ${icon_size};
        padding: 0px;
        margin: 0px;
      }
      .garbage {
        text-align: right;
        margin-right: 0px;
      }
      .day_date {
        text-align: left;
        padding: -5px;
        margin-left: 0px;
      }

      .alerted {
        color: ${due_color};
      }
      .alerted_1 {
        color: ${due_1_color};
      }
      tbody .not_current {
        font-style: italic;
      }
      ha-icon {
        --mdc-icon-size: ${icon_size};
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

  _updateContent(element, attributes, hdate, hwday, hdays, htext, hcard, oicon, elnr) {
    element.innerHTML = `
      ${attributes.map((attribute) => `
        <tr>
        <td class="tdicon">${attribute.icon1}</td>
        ${oicon === false ? '<td class="tdicon">' + `${attribute.icon2}` + '</td>' +
                            '<td class="tdicon">' + `${attribute.icon3}` + '</td>' : ''}
        <td class="${attribute.alerted} ${attribute.current} day_date">
            ${hdate === false ? `${attribute.key}` : ''}
            ${hwday === false ? `${attribute.gday}` : ''}
            ${hdays === false ? `${attribute.indays}` : ''}
        </td>
        <td class="${attribute.alerted} ${attribute.current} garbage">
            ${htext === false ? `${attribute.garbage}` : ''}
        </td>
        </tr>
     `).slice(0,elnr).join('')}
    `;
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
    let hide_card = false;
    let hide_before = -1;
    if (typeof config.hide_before != "undefined") hide_before=config.hide_before
    let one_icon = false;
    if (typeof config.one_icon != "undefined") one_icon=config.one_icon
    let items_number = 5;
    if (typeof config.items_number != "undefined") items_number=config.items_number

    let attributes = this._getAttributes(hass, config.entity.split(".")[1], one_icon);

    if (hide_before>-1) {
      let iDays = parseInt(attributes[0].indays.match(/\d+/),10);
      if (iDays > hide_before) {
        hide_card = true;
      }
    }

    this._stateObj = this._config.entity in hass.states ? hass.states[this._config.entity] : null;

    this._updateContent(root.getElementById('attributes'), attributes, hide_date, hide_wday, hide_days, hide_text, hide_card, one_icon, items_number);
  }

  getCardSize() {
    return 3;
  }
}

customElements.define('fkf-garbage-collection-card', FKFGarbageCollectionCard);
