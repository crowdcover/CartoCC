# CartoCC - Config Customizer

Very simple tool for customizing layers values of a `.mml` config file.

Warning: it's *experimental* and *work in progress".

*** Usage

For example, you may want to customize the database connection or some shp file path.

`CartoCC` makes it very simple. You just create some rules, stored in a json file, applying to layers fields. Each rule define some values to set to a layer if some field has some value.

Example of rules:

```
[
    {
        "if_field": "Datasource.type",
        "has_value": "postgis",
        "then_use": {
            "Datasource.dbname": "osm2",
            "Datasource.host": "localhost2",
            "Datasource.password": "blahblah"
        }
    },
    {
        "if_field": "id",
        "has_value": "shoreline_300",
        "then_use": {
            "Datasource.file": "/data/shoreline_300.shp"
        }
    }
]
```

Then run the script from command line:

```
node cartocc.js <path-to-project.mml> <path-to-custom-rules.json>
```