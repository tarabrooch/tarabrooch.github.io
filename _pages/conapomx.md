---
layout: post
title: "conapomx"
author: "e"
permalink: /conapomx/
---



The **conapomx** package contains the *mxpopulation* data set, which is a tidy data.frame containing population estimates from the CONAPO (National Population Commission) official agency. The estimates are divided by age groups, gender, municipality and year.


To install, just call CRAN (or github if you are reading this before it is accepted).

~~~~~~~
install.packages("conapomx") 
# or... 
library(devtools)
install_github("eflores89/conapomx")

# explore the dataset
head(mxpopulation)
~~~~~~~


<p></p>

|    y|st             | id_st|mun            | id_mun| geoid|gender  |age   | population|
|----:|:--------------|-----:|:--------------|------:|------:|:-------|:-----|----------:|
| 2010|Aguascalientes |     1|Aguascalientes |      1|   1001|0 |0-14  |  124263.71|
| 2010|Aguascalientes |     1|Aguascalientes |      1|   1001|0 |15-29 |  106695.14|
| 2010|Aguascalientes |     1|Aguascalientes |      1|   1001|0 |30-44 |   81088.65|
| 2010|Aguascalientes |     1|Aguascalientes |      1|   1001|0 |45-64 |   60379.29|
| 2010|Aguascalientes |     1|Aguascalientes |      1|   1001|0 |65+   |   17679.26|
| 2010|Aguascalientes |     1|Aguascalientes |      1|   1001|1 |0-14  |  119535.77|


<p></p>

Here is the data for 2018, just out of curiosity:

~~~~~~~
library(dplyr)

mxpopulation %>% 
  filter(y == "2018") %>%
  group_by(st) %>% 
  summarize("Population" = sum(population))
~~~~~~~

<p></p>


|st                  | Population|
|:-------------------|----------:|
|Aguascalientes      |  1337792.5|
|Baja California     |  3633772.2|
|Baja California Sur |   832827.2|
|Campeche            |   948459.3|
|Chiapas             |  5445232.7|
|Chihuahua           |  3816865.4|
|Coahuila            |  3063662.5|
|Colima              |   759686.5|
|Distrito Federal    |  8788140.6|
|Durango             |  1815965.6|
|Guanajuato          |  5952086.5|
|Guerrero            |  3625040.0|
|Hidalgo             |  2980532.2|
|Jalisco             |  8197483.1|
|Mexico              | 17604619.1|
|Michoacan           |  4687210.5|
|Morelos             |  1987595.8|
|Nayarit             |  1290518.8|
|Nuevo Leon          |  5300618.6|
|Oaxaca              |  4084674.0|
|Puebla              |  6371380.8|
|Queretaro           |  2091823.2|
|Quintana Roo        |  1709478.7|
|San Luis Potosi     |  2824976.0|
|Sinaloa             |  3059321.7|
|Sonora              |  3050472.7|
|Tabasco             |  2454294.5|
|Tamaulipas          |  3661161.7|
|Tlaxcala            |  1330142.6|
|Veracruz            |  8220321.9|
|Yucatan             |  2199617.6|
|Zacatecas           |  1612014.2|

<p></p>

Hopefully this helps to avoid the notoriously bad *datos.gob* webpage! Happy data wrangling! 
