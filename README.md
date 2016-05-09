# KBO visualization
Visualization of The Crossroads Bank for Enterprises (BCE/KBO)

## Visualisation info
### General
This visualisation is the result of a [school assignment](https://onderwijsaanbod.kuleuven.be/syllabi/n/H04I2AN.htm).

Data source: http://economie.fgov.be/nl/ondernemingen/KBO/#.Vwo7bPmLSbh

Visualisation demo: http://aerodynamica.github.io/KBOvisualization/

### Used libraries
- [d3.js v3](https://d3js.org/)
- [d3-cloud](https://github.com/jasondavies/d3-cloud) *d3 wordcloud extension*
- [d3-tip](https://github.com/Caged/d3-tip) *d3 tooltip extension*
- [jQuery v2.2.0](https://jquery.com/) *A lot of features in jQuery can be done using d3, but for rapid prototyping this was the better choice*
- [handlebarsjs v4.0.5](http://handlebarsjs.com/)
- [topojson v1.6.9](https://github.com/mbostock/topojson) *An extension to GeoJSON that encodes topology*
- [Bootstrap 3](http://getbootstrap.com/) *Only the CSS framework, not the JavaScript*
- [Select2](https://select2.github.io/) *For the search bar*

## Trends we noticed

### Wordcloud
- "Frituur" is the most common word in small restaurants
  (http://aerodynamica.github.io/KBOvisualization/?sunburstfilter=56102)
- Antwerp is still the diamond city in Belgium (and probably Europe)
  And making or selling jewels is something that is typically done in cities (Antwerp, Gent, ...)
  (http://aerodynamica.github.io/KBOvisualization/?sunburstfilter=32121)
- Beauty centers have more female than male names and contain a lot of dutch or french names (even though the most common word is "beauty"
  (http://aerodynamica.github.io/KBOvisualization/?sunburstfilter=96022)
- "Landschapsverzorning" or gardening companies contain mainly male names and a lot of dutch names (even though construct is the most common name)
 (http://aerodynamica.github.io/KBOvisualization/?sunburstfilter=81300)


### Rechtsvormen
- Notarissen kiezen het vaakst voor een Burgerlijke vennootschap onder vorm van besloten vennootschap met beperkte aanpsrakelijkheid.
(http://aerodynamica.github.io/KBOvisualization/?sunburstfilter=69102)
- Als je als Bouwarchitect start kan het interessant zijn om voor een Burgerlijke vennootschap onder vorm van besloten vennootschap met beperkte aanpsrakelijkheid te starten ipv een BVBA, die minder populair is.
(http://aerodynamica.github.io/KBOvisualization/?sunburstfilter=71111)

### Startdata
- De meeste vestigingseenheden binnen 'Serviceflats voor ouderen' zijn jong. Door de vergrijzing? (http://localhost/KBOvisualization/index.html?sunburstfilter=87302)
- Het grootste deel van de vestigingseenheden binnen 'uitgeverijen van computerspellen' zijn pas gestart na 2007.
(http://aerodynamica.github.io/KBOvisualization/?sunburstfilter=5821)

### Algemeen

- West-vlaanderen is the textile production corner of Belgium. It is an export product, which we can see in the term "Belgium" that is often placed in their company names. And because the company ages are in average older, we can spot older terms like "gebroeders" (http://aerodynamica.github.io/KBOvisualization/?sunburstfilter=13100)
- ...
