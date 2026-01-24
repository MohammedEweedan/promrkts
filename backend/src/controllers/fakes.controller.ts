import { Request, Response } from 'express';
import prisma from '../config/prisma';

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

const AR_FIRST = ['أحمد','محمد','خالد','علي','يوسف','عمر','سالم','مروان','فهد','طارق','سامي','حسن'];
const AR_LAST = ['الشريف' , 'الطاهر' ,'الشريف','طلحة','طروم','بوسنينه','الدوسري','الشامري','البنغازي','المصري','ابوجرود','العلاقي'];
const EN_FIRST = ['Ahmed','Mohamed','Khaled','Ali','Youssef','Omar','Salem','Marwan','Fahd','Tariq','Sami','Hassan','Mina','Karim'];
const EN_LAST = ['Ali','Yousef','Hassan','Younes','Haddad','Farouk','Salem','Khalifa','Nasser','Barakat'];
const FR_FIRST = ['Ahmed','Mohamed','Youssef','Omar','Karim','Rachid','Yassine','Hicham','Amine','Walid'];
const FR_LAST = ['Bennani','ElMansouri','Haddad','ElAmrani','Cherkaoui','Mansour','ElKhalfi','Nasseri'];

const COMMENTS_AR = [
  'دورة ممتازة ومفيدة جدًا.',
  'المحتوى جيد لكن كان ممكن يكون أفضل.',
  'تعلمت أشياء جديدة، شكراً.',
  'تجربة متوسطة، توقعت أكثر.',
  'شرح واضح ومنظم.',
];
const COMMENTS_EN = [
  'Great course and very useful.',
  'Good content but could be better.',
  'I learned new things, thanks.',
  'Average experience, expected more.',
  'Clear and organized explanations.',
];
const COMMENTS_FR = [
  'Excellente formation, très utile.',
  'Bon contenu mais peut être amélioré.',
  'J’ai appris des choses nouvelles, merci.',
  'Expérience moyenne, je m’attendais à plus.',
  'Explications claires et organisées.',
];

function pick<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }

// POST /admin/fakes/users { locale: 'ar'|'en'|'fr', count: number, domain?: string }
export async function createFakeUsers(req: Request, res: Response) {
  try {
    const { locale = 'ar', count = 10, domain = 'example.com' } = req.body || {} as any;
    let firsts = AR_FIRST, lasts = AR_LAST;
    if (locale === 'en') { firsts = EN_FIRST; lasts = EN_LAST; }
    if (locale === 'fr') { firsts = FR_FIRST; lasts = FR_LAST; }

    const created: any[] = [];
    for (let i = 0; i < Math.max(1, Math.min(200, Number(count))); i++) {
      const first = pick(firsts);
      const last = pick(lasts);
      const name = `${first} ${last}`;
      const base = slugify(`${first}-${last}-${Math.random().toString(36).slice(2,6)}`);
      const email = `${base}@${domain}`;
      const user = await prisma.users.create({
        data: { name, email, password: base, role: 'fake_user', status: 'active' },
      });
      created.push({ id: user.id, name: user.name, email: user.email });
    }
    return res.status(201).json({ data: created });
  } catch (e) {
    return res.status(400).json({ message: 'Unable to create fake users' });
  }
}

// POST /admin/fakes/reviews { tierId: string, total?: number, mix?: { ar?: number, en?: number, fr?: number }, ratings?: { low?: number, mid?: number, high?: number } }
export async function seedMixedReviews(req: Request, res: Response) {
  try {
    const { tierId, total = 12, mix = {}, ratings = {} } = req.body || {} as any;
    if (!tierId) return res.status(400).json({ message: 'tierId required' });

    const share = { ar: mix.ar ?? 0.34, en: mix.en ?? 0.33, fr: mix.fr ?? 0.33 };
    const count = Math.max(1, Math.min(200, Number(total)));

    const ratingMix = { low: ratings.low ?? 0.2, mid: ratings.mid ?? 0.3, high: ratings.high ?? 0.5 };

    const genRating = () => {
      const r = Math.random();
      if (r < ratingMix.low) return pick([2,3]);
      if (r < ratingMix.low + ratingMix.mid) return pick([3,4]);
      return pick([4,5]);
    };

    const buckets = [
      ...Array(Math.round(count * share.ar)).fill('ar'),
      ...Array(Math.round(count * share.en)).fill('en'),
      ...Array(Math.round(count * share.fr)).fill('fr'),
    ];
    while (buckets.length < count) buckets.push('en');

    const results: any[] = [];
    for (let i = 0; i < count; i++) {
      const locale = buckets[i];
      const pool = locale === 'ar' ? COMMENTS_AR : locale === 'fr' ? COMMENTS_FR : COMMENTS_EN;
      const review = await prisma.courseReview.create({
        data: { tierId, userId: null, rating: genRating(), comment: pick(pool) },
      });
      results.push(review);
    }

    return res.status(201).json({ data: results });
  } catch (e) {
    return res.status(400).json({ message: 'Unable to seed reviews' });
  }
}
