export const getSearchTripsQuery = () => {
  return `
query planTrip($fromPlace: String, $toPlace: String, $pageCursor: String) {
  trip(
    from: {
      place: $fromPlace
    },
    to: {
      place: $toPlace
    },
    pageCursor: $pageCursor,
  ) {
    nextPageCursor
    tripPatterns {
      expectedStartTime
      expectedEndTime
      duration
      distance
      legs {
        mode
        transportSubmode
        expectedStartTime
        expectedEndTime
        distance
        fromPlace {
          name
          quay {
            publicCode
            name
          }
        }
        toPlace {
          name
          quay {
            publicCode
            name
          }
        }
        line {
          id
          description
          transportMode
          publicCode
          authority {
            id
            name
            url
          }
        }
      }
    }
  }
}`;
};
