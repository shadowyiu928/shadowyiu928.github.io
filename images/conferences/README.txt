Conference trip photos, one folder per trip.

The folder name must match the file name in _conferences/ (without .md):
  _conferences/2025-10-iros.md  ->  images/conferences/2025-10-iros/

In that .md file:
  highlights: [icra2025-conf-1.jpg, ...] (front matter: up to 3 small photos
                                          on the Conference Trips tab)
  more_trips: true                       (front matter, optional: list the
                                          trip under "More Trips" instead of
                                          the main list)
  Your memories of the trip              (text before the first heading,
                                          shown full width)
  ## Conference / ## Travel              (two headings = two columns;
                                          rename them freely)
  ![Caption on the photo](icra2025-conf-1.jpg) (under a heading, one per line)

Each column shows its photos big, one under another, in a box you scroll
down (same size in both columns, any number of photos); on phones they just
stack. Clicking a photo opens the full-screen viewer.

Photo options (add right after a photo line, no space):
  ![caption](photo.jpg){: .tall}           taller box, for portrait photos
  ![caption](photo.jpg){: .tall .bottom}   taller box, keep the bottom part
  .top / .bottom                           which part of the photo to keep
  ![caption](photo.jpg){: .fit style="--zoom: 1.3"}
                                           same-size box, photo zoomed out to
                                           fit (blurred sides); raise --zoom to
                                           enlarge it. Add "--anchor: 40%" to
                                           choose the part that stays in view
                                           (0% = top, 100% = bottom, default)
                                           Add "--rotate: -3deg" to straighten a
                                           tilted photo (minus = anti-clockwise)

Naming: <trip><year>-conf-<n>.jpg for the Conference column and
<trip><year>-trip-<n>.jpg for the Travel column, e.g. icra2025-conf-1.jpg,
icra2025-trip-1.jpg. For "More Trips" use the city, e.g. osaka2025-trip-1.jpg,
so the conference name doesn't appear in image links. File names don't set
the order; the order of the lines in the .md file does.

Card thumbnails: after changing highlights, run
  python3 scripts/make_conference_thumbs.py
It makes small copies in <trip>/thumbs/ so the Conference Trips page loads
fast. If you forget, the cards just use the full photos (slower, still works).

Adding a new trip: copy any .md in _conferences/, rename it
YYYY-MM-name.md, update title / place / date, and create its photo folder.
