<p><a href="https://www.buymeacoffee.com/6rF5cQl" rel="nofollow" target="_blank"><img src="https://camo.githubusercontent.com/c070316e7fb193354999ef4c93df4bd8e21522fa/68747470733a2f2f696d672e736869656c64732e696f2f7374617469632f76312e7376673f6c6162656c3d4275792532306d6525323061253230636f66666565266d6573736167653d25463025394625413525413826636f6c6f723d626c61636b266c6f676f3d6275792532306d6525323061253230636f66666565266c6f676f436f6c6f723d7768697465266c6162656c436f6c6f723d366634653337" alt="Buy me a coffee" data-canonical-src="https://img.shields.io/static/v1.svg?label=Buy%20me%20a%20coffee&amp;message=%F0%9F%A5%A8&amp;color=black&amp;logo=buy%20me%20a%20coffee&amp;logoColor=white&amp;labelColor=b0c4de" style="max-width:100%;"></a></p>

[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)

# FKF Budapest Garbage Collection Card for Home Assistant

This Lovelace custom card displays garbage collection schedule provided by
the FKF Garbage Collection custom component you may find at
[https://github.com/amaximus/fkf-garbage-collection](https://github.com/amaximus/fkf-garbage-collection/).<br />
It will draw your attention the day before the garbage collection by changing the description to red by default.

Lovelace UI does not support platform attributes natively.<br />
Implementation of handling attributes in Lovelace was inspired by [entity-attributes-card](https://github.com/custom-cards/entity-attributes-card).

#### Installation
The easiest way to install it is through [HACS (Home Assistant Community Store)](https://custom-components.github.io/hacs/),
search for <i>garbage</i> and select FKF Budapest Garbage Collection Card from Plugins.<br />
If you are not using HACS, you may download fkf-garbage-collection-card.js and the translations directory and put them into
homeassistant_config_dir/www/community/fkf-garbage-collection-card/ directory.<br />

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
| icon_size | **Y** | `25px` | size for icons |
| next_only | **Y** | `false` | display only the first upcoming date |
| title | **Y** | `empty string` | card title |
---

Please find below an example of ui-lovelace.yaml (entity should be the sensor of garbage_collection platform you defined):

```
resources:
  *When using HACS installation method
  - {type: js, url: '/local/community/fkf-garbage-collection-card/fkf-garbage-collection-card.js'}
    cards:
      - type: custom:fkf-garbage-collection-card
        entity: sensor.my_garbage_schedule
        title: 'My garbage schedule'
        icon_size: 35px
```

Card alerting:<br />
![Garbage Collection card example](fkf_alerted.png)

Card hiding number of days and using translation:<br />
![Garbage Collection card example](fkf_hide_days.png)
