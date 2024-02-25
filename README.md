<div align="center">
  <img width="128" src="https://github.com/rosvik/raycast-departures/blob/main/assets/command-icon.png?raw=true" />
  <h1 align="center">Raycast Departures Extension</h1>
</div>

A raycast extension to get Norwegian public transport information. Data made available by Entur's [Journey Planner](https://developer.entur.org/pages-journeyplanner-journeyplanner).

![Screenshot](metadata/raycast-departures-2.png)

## Installing

_(If you're part of the `variant-as` organization, just install the [Departures](https://www.raycast.com/variant-as/raycast-departures) extension from the organization page.)_

1. Clone the repo
2. Run `npm install`
3. Run `npm run dev`

## Data source and usage

This extension uses Entur services as the data source. This is an open API, licensed under the Norwegian Licence for Open Government Data (NLOD). More information can be found [here](https://developer.entur.org/pages-intro-setup-and-access#licenses).

There's no authentication needed, but the API has a [rate limit of 1000 requests per minute](https://enturas.atlassian.net/wiki/spaces/PUBLIC/pages/3736993955/Rate-limit+Policy+Journey-Planner-v3#Policy-levels) shared between all users of this extension. This should be plenty for normal use, but if you're making an unusual amount of requests, please consider changing `CLIENT_NAME` in `api.ts`, using [this format](https://developer.entur.org/pages-journeyplanner-journeyplanner#authentication).
