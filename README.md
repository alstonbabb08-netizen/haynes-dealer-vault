# Haynes Dealer Vault (MechMate)

An automotive diagnostic and repair app built with Expo React Native and FastAPI.

## Project Structure

```
├── backend/           # FastAPI backend
│   ├── server.py      # Main API server
│   ├── seed_data.py   # Database seed data
│   └── tests/         # API tests
└── frontend/          # Expo React Native app
    ├── app/           # App screens and navigation
    ├── src/           # Shared utilities and services
    └── assets/        # Fonts, images, and static files
```

## Features
- Vehicle management and tracking
- VIN decoding (NHTSA vPIC)
- OBD-II code lookup
- AI-powered repair chat assistant
- Community forum
- Digital repair manuals
- Barcode/QR scanner

## Tech Stack
- **Frontend**: Expo / React Native (TypeScript)
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI**: Claude (Anthropic)
