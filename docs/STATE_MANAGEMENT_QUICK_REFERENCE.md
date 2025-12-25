# State Management Quick Reference

## 🚀 Quick Start

### 1. Subscribe to Data in Component

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ClientService } from '../services/client.service';
import { LoadingService } from '../services/loading.service';

export class MyComponent implements OnInit, OnDestroy {
  clients = [];
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private clientService: ClientService,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    // Subscribe to data
    this.clientService.clients$
      .pipe(takeUntil(this.destroy$))
      .subscribe(clients => this.clients = clients);

    // Subscribe to loading
    this.loadingService.getLoading$('clients_list')
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.isLoading = loading);

    // Load data
    this.clientService.getAllClients().subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### 2. Force Refresh Data

```typescript
refresh() {
  // Pass true to bypass cache
  this.clientService.getAllClients(true).subscribe();
}
```

### 3. Search Locally (No API Call)

```typescript
onSearch(query: string) {
  this.results = this.clientService.searchClientsLocally(query);
}
```

### 4. Get Current Data Synchronously

```typescript
getCurrentData() {
  const clients = this.clientService.getCurrentClients();
  console.log('Current clients:', clients);
}
```

## 📚 Service Methods Reference

### ClientService

| Method | Parameters | Returns | Cache |
|--------|-----------|---------|-------|
| `getAllClients(forceRefresh?)` | boolean | `Observable<Client[]>` | 10 min |
| `getClientById(id, forceRefresh?)` | number, boolean | `Observable<Client>` | 5 min |
| `createClient(client)` | Client | `Observable<Client>` | Invalidates cache |
| `updateClient(id, client)` | number, Client | `Observable<Client>` | Invalidates cache |
| `deleteClient(id)` | number | `Observable<void>` | Invalidates cache |
| `getCurrentClients()` | - | `Client[]` | - |
| `searchClientsLocally(query)` | string | `Client[]` | - |
| `clients$` | - | `Observable<Client[]>` | Live stream |
| `state$` | - | `Observable<StoreState>` | Full state |

### PetService

| Method | Parameters | Returns | Cache |
|--------|-----------|---------|-------|
| `getAllPets(forceRefresh?)` | boolean | `Observable<Pet[]>` | 10 min |
| `getPetById(id, forceRefresh?)` | number, boolean | `Observable<Pet>` | 5 min |
| `getPetsByClientId(clientId, forceRefresh?)` | number, boolean | `Observable<Pet[]>` | 10 min |
| `getPetsByClient$(clientId)` | number | `Observable<Pet[]>` | Live stream |
| `createPet(pet)` | Pet | `Observable<Pet>` | Invalidates cache |
| `updatePet(id, pet)` | number, Pet | `Observable<Pet>` | Invalidates cache |
| `deletePet(id)` | number | `Observable<void>` | Invalidates cache |
| `getCurrentPets()` | - | `Pet[]` | - |
| `searchPetsLocally(query)` | string | `Pet[]` | - |
| `pets$` | - | `Observable<Pet[]>` | Live stream |
| `state$` | - | `Observable<StoreState>` | Full state |

### AppointmentService

| Method | Parameters | Returns | Cache |
|--------|-----------|---------|-------|
| `getAllAppointments(forceRefresh?)` | boolean | `Observable<Appointment[]>` | 5 min |
| `getAppointmentById(id, forceRefresh?)` | number, boolean | `Observable<Appointment>` | 3 min |
| `getAppointmentsByDateRange(start, end, forceRefresh?)` | Date, Date, boolean | `Observable<Appointment[]>` | 2 min |
| `getAppointmentsByVeterinarianId(id, forceRefresh?)` | number, boolean | `Observable<Appointment[]>` | 5 min |
| `getAppointmentsByPetId(id, forceRefresh?)` | number, boolean | `Observable<Appointment[]>` | 5 min |
| `createAppointment(appointment)` | Appointment | `Observable<Appointment>` | Invalidates cache |
| `updateAppointment(id, appointment)` | number, Appointment | `Observable<Appointment>` | Invalidates cache |
| `deleteAppointment(id)` | number | `Observable<void>` | Invalidates cache |
| `getCurrentAppointments()` | - | `Appointment[]` | - |
| `getTodayAppointmentsLocally()` | - | `Appointment[]` | - |
| `appointments$` | - | `Observable<Appointment[]>` | Live stream |
| `state$` | - | `Observable<StoreState>` | Full state |

### LoadingService

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `setLoading(key, loading)` | string, boolean | void | Set loading state |
| `isLoading(key)` | string | boolean | Check if loading |
| `isAnyLoading()` | - | boolean | Check if any loading |
| `getLoading$(key)` | string | `Observable<boolean>` | Subscribe to loading |
| `clearAll()` | - | void | Clear all loading states |

## 🎯 Common Patterns

### Pattern: Basic List Component

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

  ngOnInit() {
    this.clientService.clients$
      .pipe(takeUntil(this.destroy$))
      .subscribe(clients => this.clients = clients);

    this.loadingService.getLoading$('clients_list')
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.isLoading = loading);

    this.clientService.getAllClients().subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Pattern: Master-Detail

```typescript
@Component({...})
export class ClientDetailComponent implements OnInit, OnDestroy {
  client: Client | null = null;
  pets: Pet[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private clientService: ClientService,
    private petService: PetService
  ) {}

  ngOnInit() {
    const clientId = +this.route.snapshot.params['id'];

    // Subscribe to client
    this.clientService.getClientById(clientId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(client => this.client = client);

    // Subscribe to client's pets
    this.petService.getPetsByClient$(clientId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(pets => this.pets = pets);

    // Load pets
    this.petService.getPetsByClientId(clientId).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Pattern: Search with Debounce

```typescript
@Component({...})
export class SearchComponent implements OnInit, OnDestroy {
  searchControl = new FormControl('');
  results: Client[] = [];
  private destroy$ = new Subject<void>();

  constructor(private clientService: ClientService) {}

  ngOnInit() {
    // Load clients once
    this.clientService.getAllClients().subscribe();

    // Subscribe to search input with debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        this.results = this.clientService.searchClientsLocally(query || '');
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Pattern: Dashboard with Multiple Sources

```typescript
@Component({...})
export class DashboardComponent implements OnInit, OnDestroy {
  stats = { clients: 0, pets: 0, appointments: 0 };
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private clientService: ClientService,
    private petService: PetService,
    private appointmentService: AppointmentService,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    // Subscribe to all data
    combineLatest([
      this.clientService.clients$,
      this.petService.pets$,
      this.appointmentService.appointments$
    ]).pipe(takeUntil(this.destroy$))
      .subscribe(([clients, pets, appointments]) => {
        this.stats = {
          clients: clients.length,
          pets: pets.length,
          appointments: appointments.length
        };
      });

    // Monitor loading states
    combineLatest([
      this.loadingService.getLoading$('clients_list'),
      this.loadingService.getLoading$('pets_list'),
      this.loadingService.getLoading$('appointments_list')
    ]).pipe(takeUntil(this.destroy$))
      .subscribe(([c, p, a]) => {
        this.isLoading = c || p || a;
      });

    // Load all data
    this.clientService.getAllClients().subscribe();
    this.petService.getAllPets().subscribe();
    this.appointmentService.getAllAppointments().subscribe();
  }

  refresh() {
    this.clientService.getAllClients(true).subscribe();
    this.petService.getAllPets(true).subscribe();
    this.appointmentService.getAllAppointments(true).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Pattern: Form with Loading

```typescript
@Component({...})
export class ClientFormComponent implements OnInit, OnDestroy {
  form: FormGroup;
  isSaving = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private loadingService: LoadingService,
    private router: Router
  ) {
    this.form = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });
  }

  ngOnInit() {
    // Subscribe to saving state
    this.loadingService.getLoading$('client_create')
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.isSaving = loading);
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.clientService.createClient(this.form.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (client) => {
          this.router.navigate(['/clients', client.client_id]);
        },
        error: (error) => {
          console.error('Error creating client:', error);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## 🔑 Loading Keys

### Client Operations
- `clients_list` - Loading all clients
- `client_{id}` - Loading specific client
- `client_create` - Creating client
- `client_update_{id}` - Updating client
- `client_delete_{id}` - Deleting client

### Pet Operations
- `pets_list` - Loading all pets
- `pet_{id}` - Loading specific pet
- `pets_client_{clientId}` - Loading pets by client
- `pet_create` - Creating pet
- `pet_update_{id}` - Updating pet
- `pet_delete_{id}` - Deleting pet

### Appointment Operations
- `appointments_list` - Loading all appointments
- `appointment_{id}` - Loading specific appointment
- `appointments_range` - Loading date range
- `appointments_vet_{vetId}` - Loading by veterinarian
- `appointments_pet_{petId}` - Loading by pet
- `appointment_create` - Creating appointment
- `appointment_update_{id}` - Updating appointment
- `appointment_delete_{id}` - Deleting appointment

## 💡 Tips & Best Practices

### ✅ DO

```typescript
// Use takeUntil for cleanup
this.service.data$.pipe(takeUntil(this.destroy$)).subscribe(...)

// Use local search for better performance
this.results = this.service.searchLocally(query);

// Use forceRefresh when you need fresh data
this.service.getData(true).subscribe();

// Subscribe to loading states
this.loadingService.getLoading$('key').subscribe(...)

// Clean up in ngOnDestroy
ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### ❌ DON'T

```typescript
// Don't forget to unsubscribe
this.service.data$.subscribe(...) // Memory leak!

// Don't manage loading states manually
this.isLoading = true;
this.service.getData().subscribe(() => {
  this.isLoading = false; // Use LoadingService instead
});

// Don't make unnecessary API calls for search
this.service.search(query).subscribe(...) // Use searchLocally()

// Don't store data in components
this.localData = data; // Use service observables

// Don't skip error handling
this.service.getData().subscribe() // Add error handler
```

## 📊 Cache TTL Reference

| Service | Operation | TTL | Reason |
|---------|-----------|-----|--------|
| Client | List | 10 min | Stable data |
| Client | Detail | 5 min | Moderate changes |
| Pet | List | 10 min | Stable data |
| Pet | Detail | 5 min | Moderate changes |
| Pet | By Client | 10 min | Stable relationships |
| Appointment | List | 5 min | Dynamic data |
| Appointment | Detail | 3 min | Time-sensitive |
| Appointment | Range | 2 min | Real-time important |

## 🚨 Troubleshooting

### Data Not Updating?

```typescript
// Force refresh to bypass cache
this.service.getAllItems(true).subscribe();

// Or invalidate cache manually
this.service.invalidateAllCache();
```

### Memory Leaks?

```typescript
// Always implement OnDestroy
export class MyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  ngOnInit() {
    this.service.data$
      .pipe(takeUntil(this.destroy$))
      .subscribe(...);
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Loading State Not Working?

```typescript
// Make sure you're using the correct loading key
this.loadingService.getLoading$('clients_list')
  .subscribe(loading => console.log('Loading:', loading));

// Check if service is calling setLoading
// Service should call: this.loadingService.setLoading('key', true/false)
```

### Stale Data?

```typescript
// Cache might be too long, reduce TTL in service
this.defaultCacheConfig = {
  ttl: 1 * 60 * 1000, // 1 minute instead of 10
  enabled: true
};

// Or force refresh more often
this.service.getAllItems(true).subscribe();
```

## 📖 See Also

- **STATE_MANAGEMENT.md** - Comprehensive guide
- **STATE_MANAGEMENT_DIAGRAMS.md** - Visual diagrams
- **IMPLEMENTATION_STATE_MANAGEMENT.md** - Implementation details
- **state-example.component.ts** - Working example
