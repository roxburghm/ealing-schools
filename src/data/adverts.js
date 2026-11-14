// The advert shown in each advert space (src/components/AdSlot.vue). One per space:
//   desktop  pinned under the school list on wide screens; shown about 380 x 120
//   mobile   in the school list on phones, after the third school; shown about 360 x 180
// Pictures live in public/adverts/, drawn at twice the size they are shown. `width` and
// `height` are the picture's own pixels: the space is kept at that shape before it loads.
// Leave a space out (or set it to null) and nothing is shown there.
const squadcars = {
  advertiser: 'SquadCars',
  href: 'https://squadcars.app/get?utm_source=schools.roxb.in&utm_medium=advert',
  alt: 'SquadCars: less chasing, every seat confirmed. Share the school run with the parents you already know. '
    + 'Get the app, 90 days free.',
};

export default {
  desktop: {...squadcars, src: '/adverts/squadcars-schools-desktop.png', width: 760, height: 240},
  mobile: {...squadcars, src: '/adverts/squadcars-schools-mobile.png', width: 720, height: 360},
};
