
# NutriLen: Visual Nutrition Analyzer

NutriLen identifies Indian food items from a photo and shows their nutritional values (calories, protein, carbohydrates, fat). Serving size can be adjusted and values are recalculated instantly. Meals are saved to a personal log.

A ConvNeXt-Tiny image classifier, fine-tuned on the KHANA Indian food dataset, powers the recognition. A React web app is the frontend, and Supabase handles storage.

> Scope: food recognition and nutrition lookup only. There is no workout tracking, diet planning or coaching.

---

## Features

- Capture or upload a food photo
- Dish recognition with confidence score (top-k predictions)
- Nutrition lookup: calories, protein, carbohydrates, fat
- Adjustable serving size with real-time recalculation
- Meal logging with timestamps (Supabase)

---

## How it works

```
React app (upload photo)
        |
        v
Python ML backend (ConvNeXt-Tiny, 224x224 input)
        |
        v
Predicted dish + confidence
        |
        v
Nutrition table lookup  ->  multiply by serving size
        |
        v
Result shown to user  ->  meal saved in Supabase
```

1. The image is resized to 224x224 and normalized.
2. ConvNeXt-Tiny outputs a probability for each food class.
3. The top prediction is matched to a row in the nutrition database.
4. Values are scaled by the chosen serving size and displayed.
5. The user can save the meal to their log.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| ML backend | Python, PyTorch, ConvNeXt-Tiny |
| Database / auth | Supabase |
| Dataset | KHANA (Indian food recognition) |

---

## Project structure

```
.
├── src/            # React frontend source
├── public/         # Static assets
├── ml_backend/     # Python model inference service
├── supabase/       # Database setup / migrations
├── index.html
├── package.json
└── README.md
```

---

## Model

| Item | Value |
|---|---|
| Architecture | ConvNeXt-Tiny (ImageNet-pretrained, fine-tuned) |
| Dataset | KHANA |
| Input size | 224 x 224 |
| Number of classes | 100 |
| Validation accuracy | 94.5 |
| Top-3 accuracy | 90.5 |

ConvNeXt was chosen because it combines CNN efficiency with transformer-inspired design, which works well for fine-grained tasks like food recognition, and the Tiny variant is small enough to serve easily.

---

## Getting started

### Prerequisites

- Node.js 18+
- Python 3.9+
- A Supabase project

### 1. Clone

```bash
git clone https://github.com/Rumanakhaisar8205/web-tech-projectt.git
cd web-tech-projectt
```

### 2. Environment variables

Create a `.env` file in the project root (never commit it). Use your own values:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

Make sure `.env` is listed in `.gitignore`.

### 3. Run the frontend

```bash
npm install
npm run dev
```

### 4. Run the ML backend

```bash
cd ml_backend
pip install -r requirements.txt
python app.py        # TODO: replace with your actual entry file
```

Place the trained model weights where the backend expects them (TODO: path or download link).

---

## Limitations

- Recognizes one dish per image. Mixed plates such as a thali are not split into items.
- Portion size comes from the serving size the user selects, not estimated from the image.
- Nutrition values are per-serving averages and vary with how a dish is cooked.

## Future work

- Multi-item detection or segmentation for mixed plates
- Portion estimation from the image
- Wider dish coverage and regional variants
- Confidence-based fallback (ask the user to confirm the top-3)

---

## References

- Liu et al., *A ConvNet for the 2020s (ConvNeXt)*, CVPR 2022
- Chanchal et al., *KHANA: A Large-Scale Dataset for Indian Food Recognition*, 2025
- Bossard et al., *Food-101: Mining Discriminative Components with Random Forests*, ECCV 2014
- Meyers et al., *Im2Calories: Towards an Automated Mobile Vision Food Diary*, ICCV 2015

## Author

Rumanakhaisar Pattankudi, KLE Technological University, Hubballi
