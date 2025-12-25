# State Management Implementation Guide

## Overview

This implementation provides centralized state management with:
- ✅ **Caching Strategy** - Intelligent caching with configurable TTL
- ✅ **Loading States** - Shared loading state management across components
- ✅ **Reactive State** - BehaviorSubjects for real-time updates
- ✅ **Performance** - Reduces unnecessary API calls
- ✅ **Consistency** - Single source of truth for data

## Architecture

### 1. Base Store Service (`base-store.service.ts`)

Foundation for all services with state management capabilities:

```typescript
export abstract class BaseStoreService<T> {
  // Automatic caching with TTL
  protected executeWithCache<D>(key: string, request: Observable<D>): Observable<D>
  
  // Loading state management
  protected executeWithLoading<D>(request: Observable<D>): Observable<D>
  
  // Combined caching + loading
  protected fetchWithCacheAndLoading<D>(key: string, request: Observable<D>): Observable<D>
  
  // State management
  protected setState(partial: Partial<StoreState<T>>): void
  public state$: Observable<StoreState<T>>
}
```

**Features:**
- Configurable cache TTL per service
- Automatic cache invalidation
- Loading state integration
- Error handling

### 2. Loading Service (`loading.service.ts`)

Global loading state management:

```typescript
@Injectable({ providedIn: 'root' })
export class LoadingService {
  setLoading(key: string, loading: boolean): void
  isLoading(key: string): boolean
  isAnyLoading(): boolean
  getLoading$(key: string): Observable<boolean>
}
```

**Usage:**
- Track multiple concurrent operations
- Component-specific loading indicators
- Global loading overlay

## Updated Services

### Client Service

**Cache Configuration:**
- List cache: 10 minutes
- Individual client: 5 minutes

**Features:**
```typescript
// Use cached data
clientService.getAllClients().subscribe(...)

// Force refresh (bypass cache)
clientService.getAllClients(true).subscribe(...)

// Subscribe to state changes
clientService.clients$.subscribe(clients => {...})

// Get current data synchronously
const clients = clientService.getCurrentClients();

// Search locally without API call
const results = clientService.searchClientsLocally('John');
```

### Pet Service

**Cache Configuration:**
- List cache: 10 minutes
- Individual pet: 5 minutes
- Pets by client: 10 minutes

**Features:**
```typescript
// Get all pets
petService.getAllPets().subscribe(...)

// Get pets by client (cached separately)
petService.getPetsByClientId(clientId).subscribe(...)

// Subscribe to client's pets
petService.getPetsByClient$(clientId).subscribe(...)

// Search locally
const results = petService.searchPetsLocally('Fluffy');
```

### Appointment Service

**Cache Configuration:**
- List cache: 5 minutes
- Individual appointment: 3 minutes
- Date ranges: 2 minutes

**Features:**
```typescript
// Get appointments with caching
appointmentService.getAllAppointments().subscribe(...)

// Date range queries (cached separately)
appointmentService.getAppointmentsByDateRange(start, end).subscribe(...)

// Get today's appointments from cache
const today = appointmentService.getTodayAppointmentsLocally();
```

## Usage Examples

### Example 1: Basic Component with Caching

```typescript
@Component({...})
export class ClientListComponent implements OnInit, OnDestroy {
  clients: Client[] = [];
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private clientService: ClientService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    // Subscribe to clients observable
    this.clientService.clients$
      .pipe(takeUntil(this.destroy$))
      .subscribe(clients => this.clients = clients);

    // Subscribe to loading state
    this.loadingService.getLoading$('clients_list')
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.isLoading = loading);

    // Load data (uses cache if available)
    this.loadClients();
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe();
  }

  refreshClients(): void {
    // Force refresh bypasses cache
    this.clientService.getAllClients(true).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Example 2: Using Full State Observable

```typescript
@Component({...})
export class ClientDetailComponent implements OnInit {
  clientState$ = this.clientService.state$;

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.clientService.state$.subscribe(state => {
      if (state.loading) {
        console.log('Loading...');
      }
      if (state.error) {
        console.error('Error:', state.error);
      }
      if (state.data) {
        console.log('Data:', state.data);
      }
    });
  }
}

// In template:
// <div *ngIf="(clientState$ | async)?.loading">Loading...</div>
// <div *ngIf="(clientState$ | async)?.error as error">{{ error }}</div>
// <div *ngIf="(clientState$ | async)?.data as clients">...</div>
```

### Example 3: Search Without API Calls

```typescript
@Component({...})
export class ClientSearchComponent implements OnInit {
  searchResults: Client[] = [];

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    // Load clients once (uses cache)
    this.clientService.getAllClients().subscribe();
  }

  onSearch(query: string): void {
    // Search locally without hitting API
    this.searchResults = this.clientService.searchClientsLocally(query);
  }
}
```

### Example 4: Master-Detail with Caching

```typescript
@Component({...})
export class ClientDetailComponent implements OnInit {
  client: Client | null = null;
  pets: Pet[] = [];

  constructor(
    private clientService: ClientService,
    private petService: PetService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const clientId = +this.route.snapshot.params['id'];

    // Load client (cached)
    this.clientService.getClientById(clientId).subscribe(
      client => this.client = client
    );

    // Load client's pets (cached separately)
    this.petService.getPetsByClientId(clientId).subscribe(
      pets => this.pets = pets
    );

    // Or subscribe to live updates:
    this.petService.getPetsByClient$(clientId).subscribe(
      pets => this.pets = pets
    );
  }
}
```

### Example 5: Dashboard with Multiple Loading States

```typescript
@Component({...})
export class DashboardComponent implements OnInit {
  loadingStates = {
    clients: false,
    appointments: false,
    pets: false
  };

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    // Monitor individual section loading
    this.loadingService.getLoading$('clients_list')
      .subscribe(loading => this.loadingStates.clients = loading);

    this.loadingService.getLoading$('appointments_range')
      .subscribe(loading => this.loadingStates.appointments = loading);

    // Check if any operation is loading
    const anyLoading = this.loadingService.isAnyLoading();
  }
}
```

## Cache Management

### Cache Keys

Services use consistent cache keys:
- `clients_all` - All clients
- `client_{id}` - Individual client
- `pets_all` - All pets
- `pet_{id}` - Individual pet
- `pets_client_{clientId}` - Pets by client
- `appointments_all` - All appointments
- `appointment_{id}` - Individual appointment
- `appointments_range_{start}_{end}` - Date range
- `appointments_vet_{vetId}` - By veterinarian
- `appointments_pet_{petId}` - By pet

### Cache Invalidation

Caches are automatically invalidated on:
- **Create** - Invalidates list caches
- **Update** - Invalidates list and specific item cache
- **Delete** - Invalidates list and specific item cache

Manual invalidation:
```typescript
// Invalidate all caches for a service
clientService.invalidateAllCache();

// Clear service state
clientService.clearState();
```

## Loading Keys

Services use these loading keys:
- `clients_list` - Loading all clients
- `client_{id}` - Loading specific client
- `client_create` - Creating client
- `client_update_{id}` - Updating client
- `client_delete_{id}` - Deleting client

Similar patterns for pets and appointments.

## Benefits

### 1. Reduced API Calls
- Data cached for configurable time periods
- Subsequent requests served from cache
- Force refresh option available

### 2. Better Performance
- Faster data access from cache
- Reduced network traffic
- Improved user experience

### 3. Consistent State
- Single source of truth
- Real-time updates via observables
- Automatic state synchronization

### 4. Better UX
- Granular loading indicators
- Section-specific loading states
- Global loading overlay option

### 5. Offline Capability Foundation
- Cached data available without network
- Can be extended for full offline support

## Best Practices

### 1. Use Cache Appropriately
```typescript
// First load or when freshness is critical
service.getData(true);  // forceRefresh = true

// Normal loads
service.getData();  // Uses cache if available
```

### 2. Subscribe to Observables
```typescript
// Good - Reactive updates
service.data$.subscribe(data => this.data = data);

// Also good - Get current snapshot
const data = service.getCurrentData();
```

### 3. Clean Up Subscriptions
```typescript
private destroy$ = new Subject<void>();

ngOnInit(): void {
  service.data$
    .pipe(takeUntil(this.destroy$))
    .subscribe(...);
}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### 4. Handle Errors
```typescript
service.state$.subscribe(state => {
  if (state.error) {
    // Show error to user
    this.errorMessage = state.error;
  }
});
```

### 5. Use Local Search for Better Performance
```typescript
// Instead of API call for each keystroke
onSearchInput(query: string): void {
  this.results = this.clientService.searchClientsLocally(query);
}
```

## Migration Guide

### Before (without state management):
```typescript
getAllClients(): void {
  this.isLoading = true;
  this.clientService.getAllClients().subscribe({
    next: clients => {
      this.clients = clients;
      this.isLoading = false;
    },
    error: error => {
      this.error = error;
      this.isLoading = false;
    }
  });
}
```

### After (with state management):
```typescript
ngOnInit(): void {
  // Subscribe to state once
  this.clientService.clients$.subscribe(
    clients => this.clients = clients
  );
  
  this.loadingService.getLoading$('clients_list').subscribe(
    loading => this.isLoading = loading
  );

  // Load data (automatic caching and loading state)
  this.clientService.getAllClients().subscribe();
}
```

## Future Enhancements

1. **Persistence** - Save cache to localStorage
2. **Optimistic Updates** - Update UI before API response
3. **Conflict Resolution** - Handle concurrent updates
4. **Network Status** - Automatic retry on connection restore
5. **Cache Policies** - More sophisticated caching strategies
6. **State Snapshots** - Save/restore application state
