// The adverts shown in each advert space (src/components/AdSlot.vue):
//   desktop  pinned under the school list on wide screens; shown about 380 x 120
//   mobile   in the school list on phones, after the third school; shown about 360 x 180
// Each space takes a list. It starts on one picked at random and moves through the rest.
// Pictures live in public/adverts/, drawn at twice the size they are shown, and every
// picture in a space must be the same shape. `width` and `height` are the picture's own
// pixels: the space is kept at that shape before it loads.
// Leave a space empty and nothing is shown there.
//
// squadcars-adverts.json is written by the squadcars repo (marketing/brand/schools-advert):
// one entry per wording, each with a picture for both spaces.
import squadcars from './squadcars-adverts.json';

const squadcarsIn = space => squadcars.map(ad => ({
  advertiser: 'SquadCars',
  // utm_content says which wording was clicked
  href: `https://squadcars.app/get?utm_source=schools.roxb.in&utm_medium=advert&utm_content=${ad.id}`,
  alt: ad.alt,
  src: `/adverts/${ad[space].file}`,
  width: ad[space].width,
  height: ad[space].height,
}));

export default {
  desktop: squadcarsIn('desktop'),
  mobile: squadcarsIn('mobile'),
};
