[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/hacs/integration)

<p><a href="https://www.buymeacoffee.com/6rF5cQl" rel="nofollow" target="_blank"><img src="https://camo.githubusercontent.com/c070316e7fb193354999ef4c93df4bd8e21522fa/68747470733a2f2f696d672e736869656c64732e696f2f7374617469632f76312e7376673f6c6162656c3d4275792532306d6525323061253230636f66666565266d6573736167653d25463025394625413525413826636f6c6f723d626c61636b266c6f676f3d6275792532306d6525323061253230636f66666565266c6f676f436f6c6f723d7768697465266c6162656c436f6c6f723d366634653337" alt="Buy me a coffee" data-canonical-src="https://img.shields.io/static/v1.svg?label=Buy%20me%20a%20coffee&amp;message=%F0%9F%A5%A8&amp;color=black&amp;logo=buy%20me%20a%20coffee&amp;logoColor=white&amp;labelColor=b0c4de" style="max-width:100%;"></a></p>

# FKF Budapest Garbage Collection Card for Home Assistant

This Lovelace custom card displays garbage collection schedule provided by
the FKF Garbage Collection custom component you may find at
[https://github.com/amaximus/fkf-garbage-collection](https://github.com/amaximus/fkf-garbage-collection/).  
It will draw your attention the day before the garbage collection by changing the description to red by default.  
When the sensor's last data fetch was unsuccessful, the schedule will be displayed in italic showing data from last successful fetch.  

Lovelace UI does not support platform attributes natively.  
Implementation of handling attributes in Lovelace was inspired by [entity-attributes-card](https://github.com/custom-cards/entity-attributes-card).

#### Installation
The easiest way to install it is through [HACS (Home Assistant Community Store)](https://github.com/hacs/frontend),
search for <i>garbage</i> and select FKF Budapest Garbage Collection Card from Plugins.  
If you are not using HACS, you may download fkf-garbage-collection-card.js and the translations directory and put them into a directory under
homeassistant_config_dir/www/ directory (see `install_path` parameter below).  

#### Lovelace UI configuration
Configuration parameters:<br />

---
| Name | Optional | `Default` | Description |
| :---- | :---- | :------- | :----------- |
| entity | **N** | - | name of the sensor of fkf_garbage_collection platform|
| due_color | **Y** | `red` | description color on due date. Accepts both color names and RGB values |
| due_1_color | **Y** | due_color | description color on the day before due date. Accepts both color names and RGB values |
| hide_before | **Y** | `false` | hide entire card until x days before event |
| hide_date | **Y** | `false` | hide date |
| hide_days | **Y** | `false` | hide number of days |
| hide_text | **Y** | `false` | hide description |
| hide_wday | **Y** | `false` | hide weekday |
| icon_size | **Y** | `24px` | size for icons |
| install_path | **Y** | `/hacsfiles/fkf-garbage-collection-card/` | local installation path. Defaults to HACS path.<BR>E.g. installed manually under /www in a dedicated directory would require: `/local/fkf-garbage-collection-card/` |
| items_number | **Y** | `5` | number of upcoming collection dates to display |
| one_icon | **Y** | `false` | display only one icon. When both communal and recycle garbage are to be collected, recycle icon will be displayed |
| title | **Y** | `empty string` | card title |
---

Please find below an example of ui-lovelace.yaml (entity should be the sensor of garbage_collection platform you defined):

```
resources:
  - {type: js, url: '/hacsfiles/fkf-garbage-collection-card/fkf-garbage-collection-card.js'}
    cards:
      - type: custom:fkf-garbage-collection-card
        entity: sensor.my_garbage_schedule
        title: 'My garbage schedule'
        icon_size: 35px
```

Alternatively, you may go to Dashboard -> Edit Dashboard -> + Add card -> Manual and copy paste the following:

```
type: custom:fkf-garbage-collection-card
entity: sensor.my_garbage_schedule
title: 'My garbage schedule'
icon_size: 35px
```

Card with hide_wday=true and items_number=1 in a browser session set to Hungarian locale:<br />
![Garbage Collection card example](fkf_card1.png)

Card with hide_wday=true and one_icon=true:<br />
![Garbage Collection card example](fkf_card2.png)
