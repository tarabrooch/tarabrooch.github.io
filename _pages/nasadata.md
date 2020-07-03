---
layout: post
title: "nasadata"
author: "e"
permalink: /nasadata/
---

This package intends to provide a hassle-free way to access some of NASA's open-source API's to build applications or models. 

Because the documentation seems inconsistent and there are *tons* of API's, I have concentrated my efforts on three which I believe provide the best "bang for my money".

The source package is built around these three API's, but for the sake of clarity, i'll group the first two into one example. 


## EONET Webservice

The Earth Observatory Natural Event Tracker is a Webservice that feeds curated natural "events" that are tracked by a few sources. It is somewhat unclear what exactly constitutes an "event"... 

From the [official docs](http://eonet.sci.gsfc.nasa.gov/eonet-project):

> The curation of events is a big component of the EONET system and while the technical details are, to an extent, straight forward, the definition of what exactly constitutes an event is fluid and daring us to be constrained. What are the contextual parameters of an event? If one curator defines a specific wildfire in Idaho as a discrete event and another defines the summer wildfire season in the Pacific Northwest as a single event, what does that mean for the end user? If an end user can filter by source/curator does that provide them with ample context for the development of their application?

> We are still thinking about these issues and how to best represent them within EONET and we encourage you to get in touch with us if you have ideas or suggestions or use cases that you have developed. 

However, at least this gives us an idea. An event is something like a storm, fire, drought, etc. 

So, let's imagine we want to see some action that occured a few days ago. 

I'll start with installing the package:
~~~~~~~
# install.packages("devtools")
devtools::install_github("Eflores89/nasadata")
library(nasadata)
~~~~~~~

Now, what **kind** of event do I want? We can query the webservice to find all of the available ones like this:

~~~~~~~
categories <- eonet_categories()
  # there are a few columns, I'll only show two...
names(categories)
# [1] "id"          "title"       "link"        "description" "layers" 
categories[,1:2]
#   id                title
#   6              Drought
#   7        Dust and Haze
#  16          Earthquakes
#   9               Floods
#  14           Landslides
#  19              Manmade
#  15     Sea and Lake Ice
#  10        Severe Storms
#  17                 Snow
#  18 Temperature Extremes
#  12            Volcanoes
#  13          Water Color
#  8            Wildfires
~~~~~~~

Who is reporting these events is probably also important, so we can see this with a similar function:

~~~~~~~
sources <- eonet_sources()
  # there are a few columns, I'll only show two...
names(sources)
# [1] "id"     "title"  "source" "link" 
sources[,1:2]
#        id                                                 title
#    CALFIRE California Department of Forestry and Fire Protection
#       CEMS               Copernicus Emergency Management Service
#         EO                                     Earth Observatory
#      GDACS         Global Disaster Alert and Coordination System
#      GLIDE                      GLobal IDEntifier Number (GLIDE)
#    InciWeb                                               InciWeb
#        IDC    International Charter on Space and Major Disasters
#        MRR                                  LANCE Rapid Response
#  NASA_ESRS            NASA Earth Science and Remote Sensing Unit
#  ReliefWeb                                             ReliefWeb
#  SIVolcano        Smithsonian Institute Global Volcanism Program
#     UNISYS                                        Unisys Weather
#   USGS_CMT  USGS Emergency Operations Collection Management Tool
#       HDDS                 USGS Hazards Data Distribution System
~~~~~~~


Now that we got this out of the way, let's see if we can get an individual event. The `earth_event()` function does this in an intuitive way. I'm going to bring only the latest event reported by InciWeb:

~~~~~~~
an_event <- earth_event(status = "all", 
                        sources = "InciWeb", 
                        category_id = "all", 
                        limit = 1,
                        LimitType = "limit")
class(an_event)
# [1] "list"
names(an_event)
# "Events"     "Sources"    "Categories" "Geography"  "Meta"  
~~~~~~~

The event is a list with a few objects parsed together:

  - **Events:** Gives us an overview of each event(s) in a data.frame. This includes id, title, description, link.
  - **Sources:** Tells us the sources by event id in a data.frame.
  - **Categories:** Categories by event id (also in a data.frame).
  - **Geography:** Gives us the coordinates or polygon where the event took place. This can be a list with lists. For example, if there are several coordinates and times (if it is an event that was prolonged or moved, like a hurricane).
  - **Meta:** Some metadata related to the query, including the string used. 

In this case, we have a fire in North Carolina...

~~~~~~~
an_event$Events$event_id
# [1] "EONET_382"
an_event$Events$event_title
# [1] "Silver Mine Fire, North Carolina"
# --- We can actually find it here:
an_event$Sources$source_url
# [1] "http://inciweb.nwcg.gov/incident/4706/"
~~~~~~~

And this is where it happened... 
~~~~~~~
an_event$Geography
#$EONET_382
#                  date  type         coordinates
#1 2016-04-21T15:00:00Z Point -82.80806, 35.89028
~~~~~~~

The coordinates are of course useful because we plot the events in our favorite **R** package (leaflet or ggmap is really nice) or we can also use it to "feed" into the other API's in the package. I'll explain these next...


## Imagery and Assets API's

The Earth Imagery API (available [here](https://api.nasa.gov/api.html#earth)) let's us access imagery that is being retrieved from Landsat 8 Satellites and stored in Google Earth Engine. From what I can see, the images are poor quality but the obvious point here is to merge them and detect large variations (for example, to track deforestation). 

The Assets API is basically a helper for the Imagery API: it gives us dates of available coordinates, so that we can query the latter and retrieve the image. 

Let's see if we can see the "event" we recorded earlier... 

First, I want to see if there is any images recorded in that time frame (the frecuency is roughly every 16 days).

> Caveat: This API requieres an active key. It's free and you can get it at api.nasa.gov

~~~~~~~
# coordinates of event
coord_long <- (-82.80806)
coord_lat <- 35.89028
key <- "example1234key"

# images available
images <- earth_asset(key, 
                      lon = coord_long, 
                      lat = coord_lat, 
                      start_date = "2016-03-01", 
                      end_date = "2016-04-30")
names(images)
# [1] "date"        "id"          "type"        "coordinates"
images$date
# [1] 2016-03-01T16:05:40 
# [2] 2016-03-17T16:05:35
# [3] 2016-04-02T16:05:26 
# [4] 2016-04-18T16:05:20
~~~~~~~

So, it seems we're out of luck... The fire ocurred **after** the last picture taken. Nonetheless, let's see how we can download this last image...

~~~~~~~
img <- earth_image(key, 
                  lon = coord_long, 
                  lat = coord_lat, 
                  date = "2016-04-18", plot = TRUE)
class(img)
# [1] "list"
~~~~~~~

The `img` object is a list consisting of two objects: 

  - **image_data**: Information about the image (date, url, cloud_score (if parameter is set to TRUE), id)
  - **image_png**: Matrix representation of the image (obtained via `png::readPNG`)

If the parameter is set to TRUE, you also get a rasterImage.


This package is still in the early stages of development, and I plan on submitting to CRAN in a few weeks, so any suggestions/improvements are very welcome at my twitter: [@eflores89](https://twitter.com/eflores89) or via issues in the github package repo: [https://github.com/Eflores89/nasadata](https://github.com/Eflores89/nasadata).
