# Refactor Guide - Simply Together Now

## 📁 Struktur Folder

```
src/
├── components/          # UI Components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── booking/        # Booking-related components
│   ├── payments/       # Payment-related components
│   ├── explore/        # Explore/Discover components
│   ├── home/           # Home page components
│   ├── profile/        # Profile-related components
│   ├── follow/         # Follow system components
│   └── info/           # Info/Content components
│
├── pages/              # Page components (routes)
│
├── hooks/              # Custom React hooks
│
├── services/           # API & Database services
│   ├── api.ts         # Centralized API service layer
│   └── index.ts       # Barrel export
│
├── types/              # TypeScript type definitions
│   └── index.ts       # Centralized types
│
├── utils/              # Utility functions
│   ├── errorHandler.ts # Global error handling
│   ├── logger.ts       # Logging system
│   ├── constants.ts   # Application constants
│   ├── dataHelpers.ts # Data manipulation helpers
│   └── index.ts       # Barrel export
│
├── lib/                # Library configurations
│   ├── utils.ts       # Utility functions (cn, etc)
│   ├── formatters.ts  # Formatting functions
│   └── validations.ts # Validation schemas
│
├── contexts/           # React Context providers
│   └── AuthContext.tsx
│
└── integrations/       # Third-party integrations
    └── supabase/      # Supabase client & types
```

## 🎯 Prinsip Refactor

### 1. Separation of Concerns
- **Components**: Hanya UI logic
- **Hooks**: Business logic & state management
- **Services**: API calls & data operations
- **Utils**: Pure functions & helpers

### 2. Single Responsibility
Setiap file hanya memiliki satu tanggung jawab utama.

### 3. DRY (Don't Repeat Yourself)
Hindari duplikasi kode. Gunakan:
- Shared components
- Custom hooks
- Utility functions
- Service layer

### 4. Type Safety
Gunakan TypeScript dengan ketat:
- Semua props harus typed
- Semua API responses harus typed
- Hindari `any` type

### 5. Error Handling
- Semua async operations harus memiliki error handling
- Gunakan `errorHandler` untuk konsistensi
- Jangan biarkan error silent

## 📝 Standar Penulisan Kode

### Naming Conventions
- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase dengan prefix `use` (`useProfile.ts`)
- **Services**: camelCase (`profileService`)
- **Types**: PascalCase (`Profile`, `Booking`)
- **Constants**: UPPER_SNAKE_CASE (`API_CONFIG`)

### File Structure
```typescript
// 1. Imports (external first, then internal)
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";

// 2. Types/Interfaces (if local)
interface Props {
  userId: string;
}

// 3. Component/Hook
export function Component({ userId }: Props) {
  // 4. Hooks
  const { profile } = useProfile();
  
  // 5. State
  const [loading, setLoading] = useState(false);
  
  // 6. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 7. Handlers
  const handleClick = () => {
    // ...
  };
  
  // 8. Render
  return <div>...</div>;
}
```

## 🔧 Best Practices

### 1. Data Fetching
Gunakan service layer, bukan langsung dari hooks:
```typescript
// ❌ Bad
const { data } = await supabase.from("profiles").select("*");

// ✅ Good
const profile = await profileService.getProfile(userId);
```

### 2. Error Handling
```typescript
// ❌ Bad
try {
  await someAsyncOperation();
} catch (error) {
  console.error(error);
}

// ✅ Good
try {
  await someAsyncOperation();
} catch (error) {
  errorHandler.showError(error, "Gagal melakukan operasi");
}
```

### 3. Null Safety
```typescript
// ❌ Bad
const name = profile.full_name;

// ✅ Good
const name = safeString(profile.full_name);
```

### 4. Type Safety
```typescript
// ❌ Bad
function getProfile(id: any) {
  // ...
}

// ✅ Good
function getProfile(id: string): Promise<Profile | null> {
  // ...
}
```

## 🚀 Optimasi Performa

### 1. Lazy Loading
Semua page components sudah menggunakan lazy loading di `App.tsx`.

### 2. Memoization
Gunakan `useMemo` dan `useCallback` untuk:
- Expensive calculations
- Object/array creation
- Function references

### 3. Code Splitting
- Components besar dipecah menjadi smaller components
- Shared logic di-extract ke custom hooks

## 🐛 Debugging

### Logging
Gunakan `logger` untuk logging:
```typescript
import { logger } from "@/utils/logger";

logger.info("User logged in", { userId });
logger.error("Failed to fetch data", error, { context });
```

### Error Tracking
Semua errors otomatis di-log melalui `errorHandler`.

## 📚 Dokumentasi

### Comments
- Gunakan JSDoc untuk functions kompleks
- Comment untuk business logic yang tidak obvious
- Hindari comment yang hanya menjelaskan apa yang sudah jelas dari kode

### README
- Setiap folder kompleks harus memiliki README
- Dokumentasikan API contracts
- Dokumentasikan data flow

## ✅ Checklist Refactor

- [x] Struktur folder rapi
- [x] Types terpusat
- [x] Service layer dibuat
- [x] Error handling global
- [x] Logging system
- [x] Constants terpusat
- [x] Helper functions
- [ ] Hooks besar di-refactor
- [ ] Components besar dipecah
- [ ] Duplikasi kode dihapus
- [ ] Import tidak terpakai dihapus
- [ ] Kode tidak terpakai dihapus
- [ ] Dokumentasi lengkap

## 🔄 Migration Path

1. **Phase 1**: Setup infrastructure (types, services, utils) ✅
2. **Phase 2**: Refactor hooks untuk menggunakan services
3. **Phase 3**: Refactor components besar
4. **Phase 4**: Clean up & optimization
5. **Phase 5**: Documentation & testing

## 📞 Support

Jika ada pertanyaan tentang struktur atau standar kode, silakan konsultasi dengan tim.

