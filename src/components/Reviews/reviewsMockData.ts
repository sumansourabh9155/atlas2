/**
 * reviewsMockData.ts — Mock Google Reviews data for the Reviews Curation feature.
 *
 * Simulates the output of the scraper + sentiment engine pipeline.
 *
 * Review statuses:
 *   shortlisted  — passed auto-filter (rating ≥ 4, sentiment > 0.5, text > 40 chars)
 *   featured     — admin explicitly marked to display on website
 *   hidden       — admin explicitly suppressed
 *   unfiltered   — did NOT pass auto-filter criteria
 */

/* ── Types ─────────────────────────────────────────────────────────────── */

export type ReviewStatus = "shortlisted" | "featured" | "hidden" | "unfiltered";

export interface GoogleReview {
  id:              string;
  author_name:     string;
  rating:          number;          // 1–5
  text:            string;
  review_time:     string;          // ISO-8601
  sentiment_score: number;          // −1 to +1 (VADER)
  status:          ReviewStatus;
}

export interface ReviewLocation {
  id:                  string;
  name:                string;
  address:             string;
  city:                string;
  state:               string;
  avgRating:           number;
  totalGoogleReviews:  number;      // total on Google (display only)
  lastFetched:         string;      // ISO-8601
  gradient:            string;      // Tailwind gradient for avatar
}

/* ── Locations ──────────────────────────────────────────────────────────── */

export const MOCK_LOCATIONS: ReviewLocation[] = [
  {
    id:                 "loc-1",
    name:               "Austin Paws Specialty & Emergency",
    address:            "2121 West Braker Lane",
    city:               "Austin",
    state:              "TX",
    avgRating:          4.6,
    totalGoogleReviews: 247,
    lastFetched:        "2026-04-29T10:30:00Z",
    gradient:           "from-teal-400 to-teal-600",
  },
  {
    id:                 "loc-2",
    name:               "Luminary Pet Care Center",
    address:            "450 S Colorado Blvd",
    city:               "Denver",
    state:              "CO",
    avgRating:          4.8,
    totalGoogleReviews: 183,
    lastFetched:        "2026-04-29T08:15:00Z",
    gradient:           "from-blue-400 to-blue-600",
  },
  {
    id:                 "loc-3",
    name:               "Golden Gate Veterinary Group",
    address:            "1540 Market St",
    city:               "San Francisco",
    state:              "CA",
    avgRating:          4.4,
    totalGoogleReviews: 312,
    lastFetched:        "2026-04-28T22:00:00Z",
    gradient:           "from-violet-400 to-violet-600",
  },
  {
    id:                 "loc-4",
    name:               "Blue Ridge Animal Hospital",
    address:            "6100 Fairview Rd",
    city:               "Charlotte",
    state:              "NC",
    avgRating:          4.7,
    totalGoogleReviews: 156,
    lastFetched:        "2026-04-29T06:45:00Z",
    gradient:           "from-amber-400 to-amber-600",
  },
];

/* ── Reviews ────────────────────────────────────────────────────────────── */

export const MOCK_REVIEWS: Record<string, GoogleReview[]> = {
  "loc-1": [
    {
      id: "r1-1", author_name: "Jessica Torres", rating: 5,
      text: "Absolutely incredible team. They saved my dog Max during an emergency surgery and were so compassionate throughout. Dr. Smith explained every step clearly. Couldn't be more grateful!",
      review_time: "2026-04-27T14:00:00Z", sentiment_score: 0.94, status: "featured",
    },
    {
      id: "r1-2", author_name: "Marcus Webb", rating: 5,
      text: "The specialists here are top notch. My cat had a rare kidney condition and they handled it with expertise and genuine care. Staff is always kind and responsive. Highly recommend.",
      review_time: "2026-04-25T09:30:00Z", sentiment_score: 0.88, status: "featured",
    },
    {
      id: "r1-3", author_name: "Priya Nair", rating: 4,
      text: "Great facility with experienced vets. Wait times can be long during peak hours but the quality of care makes up for it. My labrador has been a patient here for 3 years.",
      review_time: "2026-04-23T16:20:00Z", sentiment_score: 0.72, status: "shortlisted",
    },
    {
      id: "r1-4", author_name: "Daniel Kim", rating: 5,
      text: "Emergency visit at 2am and they were fully staffed and professional. Diagnosed my puppy quickly and had him stable within the hour. Life savers — literally.",
      review_time: "2026-04-20T02:15:00Z", sentiment_score: 0.96, status: "shortlisted",
    },
    {
      id: "r1-5", author_name: "Sofia Reyes", rating: 4,
      text: "Really impressed with the specialist consultation. The doctor spent nearly 45 minutes explaining my senior dog's arthritis options. Front desk team is always helpful too.",
      review_time: "2026-04-18T11:00:00Z", sentiment_score: 0.81, status: "shortlisted",
    },
    {
      id: "r1-6", author_name: "Tom Nguyen", rating: 2,
      text: "Parking is terrible and the billing process was confusing. Waited 2 hours with a sick cat and felt like nobody was giving us updates. Very disappointing experience overall.",
      review_time: "2026-04-15T17:45:00Z", sentiment_score: -0.63, status: "hidden",
    },
    {
      id: "r1-7", author_name: "Angela Brown", rating: 5,
      text: "Outstanding! The oncology team here gave my dog Bella a fighting chance. They were honest about the prognosis while still giving us hope. True professionals who care deeply.",
      review_time: "2026-04-12T13:00:00Z", sentiment_score: 0.91, status: "featured",
    },
    {
      id: "r1-8", author_name: "Ryan Patel", rating: 3,
      text: "Average experience. The vet seemed rushed.",
      review_time: "2026-04-10T10:00:00Z", sentiment_score: 0.12, status: "unfiltered",
    },
    {
      id: "r1-9", author_name: "Chloe Martinez", rating: 5,
      text: "The neurology team is exceptional. My dog was having seizures and they were so thorough in their diagnosis. The on-site MRI facility is a huge plus. Trusted partners for life.",
      review_time: "2026-04-08T15:30:00Z", sentiment_score: 0.93, status: "shortlisted",
    },
  ],
  "loc-2": [
    {
      id: "r2-1", author_name: "Emma Sullivan", rating: 5,
      text: "Best vet in Denver, hands down. Dr. Chen is incredible with my anxious rescue dog. She always takes extra time to make him feel comfortable before any examination.",
      review_time: "2026-04-28T10:00:00Z", sentiment_score: 0.97, status: "featured",
    },
    {
      id: "r2-2", author_name: "Carlos Rivera", rating: 5,
      text: "Friendly staff, clean facility, and genuinely caring vets. My two cats are always well cared for here. They also send helpful reminders for upcoming vaccinations.",
      review_time: "2026-04-26T14:30:00Z", sentiment_score: 0.89, status: "featured",
    },
    {
      id: "r2-3", author_name: "Natalie Brooks", rating: 4,
      text: "Really positive experience for our rabbit's checkup. Most vets don't specialize in small animals but these folks really know their stuff. Great communication throughout.",
      review_time: "2026-04-22T09:00:00Z", sentiment_score: 0.78, status: "shortlisted",
    },
    {
      id: "r2-4", author_name: "James Okonkwo", rating: 5,
      text: "Called in a panic when my dog swallowed something. They walked me through first steps on the phone and had a spot ready when I arrived. Exceptional service under pressure.",
      review_time: "2026-04-19T19:00:00Z", sentiment_score: 0.95, status: "shortlisted",
    },
    {
      id: "r2-5", author_name: "Lisa Chen", rating: 1,
      text: "Overpriced and the vet barely looked at my cat for ten minutes before charging $200. Never coming back to this place.",
      review_time: "2026-04-14T16:00:00Z", sentiment_score: -0.87, status: "unfiltered",
    },
    {
      id: "r2-6", author_name: "Omar Hassan", rating: 4,
      text: "Had a great experience with the wellness plan. Really affordable for annual care. The vets take time to educate you about diet and preventive care. Highly recommend.",
      review_time: "2026-04-12T11:45:00Z", sentiment_score: 0.83, status: "shortlisted",
    },
    {
      id: "r2-7", author_name: "Patricia Lee", rating: 5,
      text: "Went through the hardest moment losing our cat of 16 years. The compassion and support we received made a terrible day more bearable. A team that truly cares.",
      review_time: "2026-04-09T14:00:00Z", sentiment_score: 0.85, status: "shortlisted",
    },
    {
      id: "r2-8", author_name: "Kevin Morris", rating: 3,
      text: "OK place. Not bad but nothing special.",
      review_time: "2026-04-07T12:00:00Z", sentiment_score: 0.08, status: "unfiltered",
    },
  ],
  "loc-3": [
    {
      id: "r3-1", author_name: "Amara Singh", rating: 5,
      text: "The team here is absolutely phenomenal. Dr. Wallace took time to explain every step of my cat's surgery. Recovery has been smooth and they've been available for questions all week.",
      review_time: "2026-04-27T09:00:00Z", sentiment_score: 0.92, status: "featured",
    },
    {
      id: "r3-2", author_name: "Brian O'Connor", rating: 4,
      text: "Solid veterinary practice. The facility is state-of-the-art and the staff are always polite. Pricing is on the higher end for SF but the quality of care is worth every cent.",
      review_time: "2026-04-24T15:30:00Z", sentiment_score: 0.74, status: "shortlisted",
    },
    {
      id: "r3-3", author_name: "Yuki Tanaka", rating: 5,
      text: "Brought my elderly beagle in for a dental procedure. The pre-op consultation was thorough and the aftercare instructions were crystal clear. Zero anxiety about the process.",
      review_time: "2026-04-21T12:00:00Z", sentiment_score: 0.88, status: "shortlisted",
    },
    {
      id: "r3-4", author_name: "Diana Flores", rating: 2,
      text: "Waited 45 min past my appointment. The vet seemed distracted and dismissive. Expected much better for the price they charge. Very disappointing.",
      review_time: "2026-04-18T17:00:00Z", sentiment_score: -0.54, status: "hidden",
    },
    {
      id: "r3-5", author_name: "Lucas Novak", rating: 5,
      text: "Can't say enough about how this practice handled our husky's cancer diagnosis. They were honest, empathetic, and connected us with a specialist immediately. True patient advocates.",
      review_time: "2026-04-16T10:30:00Z", sentiment_score: 0.90, status: "featured",
    },
    {
      id: "r3-6", author_name: "Fatima Al-Hassan", rating: 4,
      text: "Really appreciate the multilingual staff. My Farsi-speaking grandmother came with me and they found someone who could communicate with her directly. Thoughtful and inclusive.",
      review_time: "2026-04-13T11:00:00Z", sentiment_score: 0.82, status: "shortlisted",
    },
    {
      id: "r3-7", author_name: "Scott Williams", rating: 3,
      text: "My appointment was fine. Nothing went wrong but nothing stood out either. Average experience all around.",
      review_time: "2026-04-10T09:00:00Z", sentiment_score: 0.15, status: "unfiltered",
    },
    {
      id: "r3-8", author_name: "Rebecca Hunt", rating: 5,
      text: "Always leave impressed. My golden retriever is so comfortable here and that says a lot — she's usually terrified of vets. The team clearly loves animals and it shows in every interaction.",
      review_time: "2026-04-07T16:00:00Z", sentiment_score: 0.95, status: "featured",
    },
  ],
  "loc-4": [
    {
      id: "r4-1", author_name: "Michael Turner", rating: 5,
      text: "Took my new puppy for his first checkup and the experience was delightful. The vet spent 30 minutes walking through a full puppy care guide. You can tell they love what they do.",
      review_time: "2026-04-28T13:00:00Z", sentiment_score: 0.96, status: "featured",
    },
    {
      id: "r4-2", author_name: "Hannah Reed", rating: 5,
      text: "My senior cat Mochi has been coming here for 7 years. The staff remembers her by name and always greets her with such warmth. This place genuinely feels like family.",
      review_time: "2026-04-25T10:00:00Z", sentiment_score: 0.93, status: "featured",
    },
    {
      id: "r4-3", author_name: "Andre Williams", rating: 4,
      text: "Fast, friendly, and thorough. Annual wellness visits are easy to book online and the text reminders are super helpful. Great value for the level of care quality you receive.",
      review_time: "2026-04-22T14:00:00Z", sentiment_score: 0.79, status: "shortlisted",
    },
    {
      id: "r4-4", author_name: "Mei Zhang", rating: 4,
      text: "Very professional. The vet noticed a slight heart murmur during a routine visit that I had no idea about. Grateful for their thoroughness and proactive approach to health.",
      review_time: "2026-04-19T11:30:00Z", sentiment_score: 0.77, status: "shortlisted",
    },
    {
      id: "r4-5", author_name: "Greg Hoffman", rating: 2,
      text: "The receptionist was dismissive when I called to ask about pricing options. Didn't feel welcomed as a new client. Would not recommend based on this first impression.",
      review_time: "2026-04-16T09:00:00Z", sentiment_score: -0.71, status: "hidden",
    },
    {
      id: "r4-6", author_name: "Stephanie Park", rating: 5,
      text: "Blue Ridge has been our family vet for years and we wouldn't go anywhere else. Every vet here is knowledgeable, gentle with our animals, and clear in communication. Simply the best.",
      review_time: "2026-04-13T15:00:00Z", sentiment_score: 0.98, status: "shortlisted",
    },
    {
      id: "r4-7", author_name: "Derek Johnson", rating: 3,
      text: "Wait was longer than expected but care was decent.",
      review_time: "2026-04-10T10:00:00Z", sentiment_score: 0.18, status: "unfiltered",
    },
    {
      id: "r4-8", author_name: "Laura Mitchell", rating: 5,
      text: "Exceptionally caring staff who went above and beyond when my dog needed emergency care after hours. They called to check in the next two days. Truly remarkable and human service.",
      review_time: "2026-04-07T22:00:00Z", sentiment_score: 0.97, status: "shortlisted",
    },
  ],
};
