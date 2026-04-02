export function currentConditionsFixture() {
  return {
    currentTime: "2026-04-02T13:02:27.665Z",
    timeZone: { id: "Africa/Johannesburg" },
    isDaytime: true,
    weatherCondition: {
      iconBaseUri: "https://maps.gstatic.com/weather/v1/mostly_cloudy",
      description: { text: "Mostly cloudy", languageCode: "en" },
      type: "MOSTLY_CLOUDY",
    },
    temperature: { degrees: 24.4, unit: "CELSIUS" },
    feelsLikeTemperature: { degrees: 25.9, unit: "CELSIUS" },
    relativeHumidity: 64,
    uvIndex: 2,
    precipitation: {
      probability: { percent: 10, type: "RAIN" },
      qpf: { quantity: 0, unit: "MILLIMETERS" },
    },
    airPressure: { meanSeaLevelMillibars: 1016.48 },
    wind: {
      direction: { degrees: 169, cardinal: "SOUTH" },
      speed: { value: 5, unit: "KILOMETERS_PER_HOUR" },
      gust: { value: 11, unit: "KILOMETERS_PER_HOUR" },
    },
    visibility: { distance: 16, unit: "KILOMETERS" },
    cloudCover: 69,
    currentConditionsHistory: {
      temperatureChange: { degrees: 1.9, unit: "CELSIUS" },
      maxTemperature: { degrees: 25.4, unit: "CELSIUS" },
      minTemperature: { degrees: 16.9, unit: "CELSIUS" },
    },
  };
}

export function forecastHoursFixture() {
  return {
    forecastHours: [
      {
        interval: {
          startTime: "2026-04-02T13:00:00Z",
          endTime: "2026-04-02T14:00:00Z",
        },
        isDaytime: true,
        weatherCondition: {
          iconBaseUri: "https://maps.gstatic.com/weather/v1/mostly_cloudy",
          description: { text: "Mostly cloudy", languageCode: "en" },
          type: "MOSTLY_CLOUDY",
        },
        temperature: { degrees: 24.4, unit: "CELSIUS" },
        feelsLikeTemperature: { degrees: 25.9, unit: "CELSIUS" },
        precipitation: {
          probability: { percent: 10, type: "RAIN" },
          qpf: { quantity: 0, unit: "MILLIMETERS" },
        },
        airPressure: { meanSeaLevelMillibars: 1016.48 },
        wind: {
          direction: { degrees: 169, cardinal: "SOUTH" },
          speed: { value: 5, unit: "KILOMETERS_PER_HOUR" },
          gust: { value: 11, unit: "KILOMETERS_PER_HOUR" },
        },
        visibility: { distance: 16, unit: "KILOMETERS" },
        relativeHumidity: 64,
        uvIndex: 2,
        cloudCover: 69,
      },
      {
        interval: {
          startTime: "2026-04-02T16:00:00Z",
          endTime: "2026-04-02T17:00:00Z",
        },
        isDaytime: true,
        weatherCondition: {
          iconBaseUri: "https://maps.gstatic.com/weather/v1/drizzle",
          description: { text: "Light rain", languageCode: "en" },
          type: "LIGHT_RAIN",
        },
        temperature: { degrees: 22.2, unit: "CELSIUS" },
        feelsLikeTemperature: { degrees: 24.6, unit: "CELSIUS" },
        precipitation: {
          probability: { percent: 35, type: "RAIN" },
          qpf: { quantity: 0.48, unit: "MILLIMETERS" },
        },
        airPressure: { meanSeaLevelMillibars: 1016.73 },
        wind: {
          direction: { degrees: 64, cardinal: "EAST_NORTHEAST" },
          speed: { value: 5, unit: "KILOMETERS_PER_HOUR" },
          gust: { value: 13, unit: "KILOMETERS_PER_HOUR" },
        },
        visibility: { distance: 16, unit: "KILOMETERS" },
        relativeHumidity: 73,
        uvIndex: 0,
        cloudCover: 96,
      },
    ],
  };
}

export function historyHoursFixture() {
  return {
    historyHours: [
      {
        interval: {
          startTime: "2026-04-02T08:00:00Z",
          endTime: "2026-04-02T09:00:00Z",
        },
        isDaytime: true,
        weatherCondition: {
          iconBaseUri: "https://maps.gstatic.com/weather/v1/mostly_cloudy",
          description: { text: "Mostly cloudy", languageCode: "en" },
          type: "MOSTLY_CLOUDY",
        },
        temperature: { degrees: 21.9, unit: "CELSIUS" },
        feelsLikeTemperature: { degrees: 24.5, unit: "CELSIUS" },
        precipitation: {
          probability: { percent: 10, type: "RAIN" },
          qpf: { quantity: 0, unit: "MILLIMETERS" },
        },
        airPressure: { meanSeaLevelMillibars: 1018.66 },
        wind: {
          direction: { degrees: 222, cardinal: "SOUTHWEST" },
          speed: { value: 5, unit: "KILOMETERS_PER_HOUR" },
          gust: { value: 10, unit: "KILOMETERS_PER_HOUR" },
        },
        visibility: { distance: 16, unit: "KILOMETERS" },
        relativeHumidity: 69,
        uvIndex: 2,
        cloudCover: 67,
      },
    ],
  };
}

export function forecastDaysFixture() {
  return {
    forecastDays: [
      {
        interval: {
          startTime: "2026-04-02T05:00:00Z",
          endTime: "2026-04-03T05:00:00Z",
        },
        daytimeForecast: {
          weatherCondition: {
            iconBaseUri: "https://maps.gstatic.com/weather/v1/drizzle",
            description: { text: "Light rain", languageCode: "en" },
            type: "LIGHT_RAIN",
          },
          relativeHumidity: 68,
          uvIndex: 2,
          precipitation: {
            probability: { percent: 35, type: "RAIN" },
            qpf: { quantity: 0.48, unit: "MILLIMETERS" },
          },
          wind: {
            direction: { degrees: 176, cardinal: "SOUTH" },
            speed: { value: 5, unit: "KILOMETERS_PER_HOUR" },
          },
        },
        nighttimeForecast: {
          weatherCondition: {
            iconBaseUri: "https://maps.gstatic.com/weather/v1/cloudy",
            description: { text: "Cloudy", languageCode: "en" },
            type: "CLOUDY",
          },
          relativeHumidity: 88,
          uvIndex: 0,
          precipitation: {
            probability: { percent: 60, type: "RAIN" },
            qpf: { quantity: 3.36, unit: "MILLIMETERS" },
          },
          wind: {
            direction: { degrees: 7, cardinal: "NORTH" },
            speed: { value: 6, unit: "KILOMETERS_PER_HOUR" },
          },
        },
        maxTemperature: { degrees: 25.4, unit: "CELSIUS" },
        minTemperature: { degrees: 17.1, unit: "CELSIUS" },
        feelsLikeMaxTemperature: { degrees: 26.4, unit: "CELSIUS" },
        feelsLikeMinTemperature: { degrees: 17.1, unit: "CELSIUS" },
        sunEvents: {
          sunriseTime: "2026-04-02T04:40:43.499Z",
          sunsetTime: "2026-04-02T16:21:28.293Z",
        },
        moonEvents: { moonPhase: "FULL_MOON" },
      },
      {
        interval: {
          startTime: "2026-04-03T05:00:00Z",
          endTime: "2026-04-04T05:00:00Z",
        },
        daytimeForecast: {
          weatherCondition: {
            iconBaseUri: "https://maps.gstatic.com/weather/v1/showers",
            description: { text: "Rain", languageCode: "en" },
            type: "RAIN",
          },
          relativeHumidity: 89,
          uvIndex: 2,
          precipitation: {
            probability: { percent: 65, type: "RAIN" },
            qpf: { quantity: 10.24, unit: "MILLIMETERS" },
          },
          wind: {
            direction: { degrees: 258, cardinal: "WEST_SOUTHWEST" },
            speed: { value: 11, unit: "KILOMETERS_PER_HOUR" },
          },
        },
        nighttimeForecast: {
          weatherCondition: {
            iconBaseUri: "https://maps.gstatic.com/weather/v1/mostly_cloudy_night",
            description: { text: "Mostly cloudy", languageCode: "en" },
            type: "MOSTLY_CLOUDY",
          },
          relativeHumidity: 97,
          uvIndex: 0,
          precipitation: {
            probability: { percent: 65, type: "RAIN" },
            qpf: { quantity: 5, unit: "MILLIMETERS" },
          },
          wind: {
            direction: { degrees: 285, cardinal: "WEST_NORTHWEST" },
            speed: { value: 10, unit: "KILOMETERS_PER_HOUR" },
          },
        },
        maxTemperature: { degrees: 22, unit: "CELSIUS" },
        minTemperature: { degrees: 16.8, unit: "CELSIUS" },
        feelsLikeMaxTemperature: { degrees: 24.5, unit: "CELSIUS" },
        feelsLikeMinTemperature: { degrees: 16.8, unit: "CELSIUS" },
        sunEvents: {
          sunriseTime: "2026-04-03T04:41:28.567Z",
          sunsetTime: "2026-04-03T16:20:08.295Z",
        },
        moonEvents: { moonPhase: "WANING_GIBBOUS" },
      },
    ],
  };
}
