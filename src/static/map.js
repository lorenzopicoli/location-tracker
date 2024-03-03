const { DeckGL, HeatmapLayer, IconLayer, DataFilterExtension } = deck

function isMobile() {
  let check = false
  ;((a) => {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true
  })(navigator.userAgent || navigator.vendor || window.opera)
  return check
}

const deckgl = new DeckGL({
  mapStyle:
    'https://tiles.basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  initialViewState: {
    longitude: -40.2909793,
    latitude: -20.2970474,
    zoom: 6,
    minZoom: 1,
    maxZoom: 50,
  },
  container: document.getElementById('container'),
  controller: true, // Define extensions
})

const COLOR_RANGE = [
  [253, 203, 179],
  [251, 172, 140],
  [252, 140, 106],
  [251, 110, 78],
  [225, 65, 59],
  [240, 93, 99],
]

let events = []
let isAnimationOn = false
let currentAnimationDate
let lastAnimationEventIndex = 0

function formatUnixTimestamp(unixTimestamp, timezone) {
  // Convert Unix timestamp to milliseconds
  const timestampInMilliseconds = unixTimestamp * 1000

  // Create a Date object with the timestamp
  const date = new Date(timestampInMilliseconds)

  // Format the date with the specified timezone
  const options = {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  }

  const formattedDate = new Intl.DateTimeFormat('pt-BR', options).format(date)

  return formattedDate
}

function getTextForEvent(event) {
  const connectionType =
    event.connectivity_status === 'w'
      ? 'wifi'
      : event.connectivity_status === 'o'
      ? 'offline'
      : 'data'
  const batteryStatus =
    event.battery_status === 0
      ? 'unknown'
      : event.battery_status === 1
      ? 'unplugged'
      : event.battery_status === 2
      ? 'charging'
      : 'full'

  return `Connection type: ${connectionType}
Battery status: ${batteryStatus} - ${event.battery_level ?? -1}%
Creation date: ${formatUnixTimestamp(
    event.message_creation_time,
    'America/New_York'
  )}`
}

function renderLayer() {
  const startDate = dayjs(document.getElementById('startDatePicker').value)
  const endDate = dayjs(document.getElementById('endDatePicker').value)
  const filterCheckbox = document.getElementById('filterCheckbox')
  if (filterCheckbox.checked && (!startDate.isValid() || !endDate.isValid())) {
    return
  }

  const animationStartDatePicker = document.getElementById(
    'animationStartDatePicker'
  )
  const animationStartDate = dayjs(animationStartDatePicker.value)
  const filters = {
    getFilterValue: (d) => {
      return dayjs.unix(d.message_creation_time).unix()
    },
    filterRange: isAnimationOn
      ? [
          animationStartDate.unix(),
          currentAnimationDate.clone().add(5, 'second').unix(),
        ]
      : filterCheckbox.checked
      ? [startDate, endDate]
      : [-Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
    extensions: [
      new DataFilterExtension({
        filterSize: 1,
        // Important for precise unix timestamp filtering
        fp64: true,
      }),
    ],
  }
  const iconLayer = new IconLayer({
    id: 'icons',
    data: events,
    pickable: true,
    sizeScale: isMobile() ? 50 : 15,
    getPosition: (l) => [l.longitude, l.latitude],
    onClick: (object, _event) => {
      if (object.index === -1) {
        return
      }
      const event = events[object.index]
      alert(getTextForEvent(event))
      return true
    },
    getIcon: () => ({
      width: 50,
      height: 50,
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Map_marker.svg/390px-Map_marker.svg.png',
    }),
    ...filters,
  })

  deckgl.setProps({
    layers: [iconLayer],
    getTooltip: (object) => {
      if (object.index === -1) {
        return
      }
      const event = events[object.index]
      return getTextForEvent(event)
    },
  })
}

fetch('/events')
  .then((response) => {
    return response.json()
  })
  .then((points) => {
    events = points
    renderLayer()
  })
  .catch((err) => {
    console.warn('Something went wrong.', err)
  })

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000)
}

document.addEventListener('DOMContentLoaded', () => {
  const startDatePicker = document.getElementById('startDatePicker')
  const animationStartDate = document.getElementById('animationStartDatePicker')
  const startAnimationButton = document.getElementById('startAnimationButton')
  const stopAnimationButton = document.getElementById('stopAnimationButton')
  const animationSpeed = document.getElementById('animationSpeedPicker')
  const currentAnimationDateEl = document.getElementById('currentAnimationDate')
  const animationSupportText = document.getElementById('animationSupportText')

  filterCheckbox.addEventListener('change', renderLayer)
  startDatePicker.addEventListener('change', renderLayer)
  animationStartDate.addEventListener('change', renderLayer)

  let interval

  startAnimationButton.addEventListener('click', () => {
    isAnimationOn = true
    if (interval) {
      clearInterval(interval)
    }
    lastAnimationEventIndex = events.findIndex((e) =>
      dayjs
        .unix(e.message_creation_time)
        .isAfter(dayjs(animationStartDate.value))
    )
    // Yeah yeah I know
    animationSupportText.innerHTML = 'State: (ON)'
    interval = setInterval(() => {
      if (lastAnimationEventIndex + 1 >= events.length) {
        isAnimationOn = false
        renderLayer()
        clearInterval(interval)
        return
      }
      currentAnimationDate = dayjs.unix(
        events[lastAnimationEventIndex].message_creation_time
      )
      // Yeah yeah I know
      currentAnimationDateEl.innerText = currentAnimationDate.format(
        'DD/MM/YYYY HH:mm:ss'
      )
      renderLayer()
      lastAnimationEventIndex++
    }, animationSpeed.value * 1000)
  })
  stopAnimationButton.addEventListener('click', () => {
    // Yeah yeah I know
    animationSupportText.innerHTML = 'State: (OFF)'
    if (interval) {
      clearInterval(interval)
    }
    isAnimationOn = false
    renderLayer()
  })
})
