# State Management Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Application Layer                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Dashboard   │  │ Client List  │  │   Pet List   │              │
│  │  Component   │  │  Component   │  │  Component   │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                 │                        │
│         └─────────────────┴─────────────────┘                        │
│                           │                                          │
│              Subscribe to observables & loading states               │
│                           │                                          │
└───────────────────────────┼──────────────────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────────────┐
│                    Service Layer (State Management)                  │
├───────────────────────────┼──────────────────────────────────────────┤
│                           ▼                                          │
│  ┌─────────────────────────────────────────────────────┐            │
│  │         LoadingService (Global)                      │            │
│  │  ┌────────────────────────────────────┐             │            │
│  │  │  loadingState$ BehaviorSubject     │             │            │
│  │  │  { 'clients_list': true, ... }     │             │            │
│  │  └────────────────────────────────────┘             │            │
│  └─────────────────────────────────────────────────────┘            │
│                                                                       │
│  ┌────────────────────┐  ┌────────────────────┐  ┌─────────────┐   │
│  │  ClientService     │  │   PetService       │  │ AppointmentS│   │
│  │  (extends Base)    │  │   (extends Base)   │  │ ervice      │   │
│  ├────────────────────┤  ├────────────────────┤  ├─────────────┤   │
│  │                    │  │                    │  │             │   │
│  │ clients$           │  │ pets$              │  │appointments$│   │
│  │ BehaviorSubject    │  │ BehaviorSubject    │  │BehaviorSub  │   │
│  │                    │  │                    │  │             │   │
│  │ state$             │  │ state$             │  │ state$      │   │
│  │ {data, loading,    │  │ {data, loading,    │  │ {data,      │   │
│  │  error, updated}   │  │  error, updated}   │  │  loading}   │   │
│  │                    │  │                    │  │             │   │
│  │ Cache Map          │  │ Cache Map          │  │ Cache Map   │   │
│  │ ┌────────────────┐ │  │ ┌────────────────┐ │  │ ┌─────────┐ │   │
│  │ │clients_all: {} │ │  │ │pets_all: {}    │ │  │ │appts_all│ │   │
│  │ │client_123: {}  │ │  │ │pet_456: {}     │ │  │ │appt_789 │ │   │
│  │ │ TTL: 10min     │ │  │ │pets_client_12  │ │  │ │range_...│ │   │
│  │ └────────────────┘ │  │ └────────────────┘ │  │ └─────────┘ │   │
│  └────────┬───────────┘  └────────┬───────────┘  └──────┬──────┘   │
│           │                       │                     │           │
└───────────┼───────────────────────┼─────────────────────┼───────────┘
            │                       │                     │
            └───────────────────────┴─────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────────────┐
│                    HTTP Layer (API Calls)                             │
├───────────────────────────┼──────────────────────────────────────────┤
│                           ▼                                          │
│  ┌─────────────────────────────────────────────────────┐            │
│  │         HTTP Client (with Auth Interceptor)          │            │
│  └────────────────────┬────────────────────────────────┘            │
│                       │                                              │
└───────────────────────┼──────────────────────────────────────────────┘
                        │
                        ▼
              Backend API (Go Server)
```

## Data Flow Diagram

### Read Operation (with Cache)

```
Component Request
       │
       ▼
Service.getAllClients()
       │
       ▼
Check Cache: isCacheValid('clients_all')?
       │
    ┌──┴──┐
    │     │
   YES    NO
    │     │
    │     ▼
    │  Set LoadingService('clients_list', true)
    │     │
    │     ▼
    │  HTTP GET /api/v1/clients
    │     │
    │     ▼
    │  Store in Cache (TTL: 10min)
    │     │
    └──┬──┘
       │
       ▼
Update clients$ BehaviorSubject
       │
       ▼
Set LoadingService('clients_list', false)
       │
       ▼
All subscribed components receive update
       │
       ▼
Components re-render with new data
```

### Write Operation (Create/Update/Delete)

```
Component Action
       │
       ▼
Service.createClient(data)
       │
       ▼
Set LoadingService('client_create', true)
       │
       ▼
HTTP POST /api/v1/clients
       │
       ▼
Invalidate Related Caches:
  - clients_all
  - Any related caches
       │
       ▼
Update clients$ BehaviorSubject
  [add new client to array]
       │
       ▼
Set LoadingService('client_create', false)
       │
       ▼
All subscribed components auto-update
       │
       ▼
UI reflects new client immediately
```

### Local Search (No API Call)

```
User Types in Search Box
       │
       ▼
Component.onSearch(query)
       │
       ▼
Service.searchClientsLocally(query)
       │
       ▼
Filter getCurrentClients() array
  [in-memory operation]
       │
       ▼
Return filtered results
       │
       ▼
Component updates filteredClients
       │
       ▼
UI updates instantly (0 network delay)
```

## State Synchronization

```
┌────────────────────────────────────────────────────────────┐
│                     Service State                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  clients$ BehaviorSubject<Client[]>                  │  │
│  │  [                                                    │  │
│  │    { id: 1, name: 'John Doe', email: 'john@...' }   │  │
│  │    { id: 2, name: 'Jane Smith', email: 'jane@...' } │  │
│  │  ]                                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│         │              │              │              │      │
│         │              │              │              │      │
└─────────┼──────────────┼──────────────┼──────────────┼──────┘
          │              │              │              │
          ▼              ▼              ▼              ▼
   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │Component │   │Component │   │Component │   │Component │
   │    A     │   │    B     │   │    C     │   │    D     │
   │ (List)   │   │(Detail)  │   │(Search)  │   │(Summary) │
   └──────────┘   └──────────┘   └──────────┘   └──────────┘

When Service Updates State:
  1. New client added/updated/deleted
  2. clients$ BehaviorSubject emits new value
  3. All subscribed components receive update automatically
  4. Each component re-renders with latest data
  5. UI stays synchronized across entire application
```

## Loading State Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  LoadingService State                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  loadingState$: {                                      │ │
│  │    'clients_list': true,                              │ │
│  │    'pets_list': true,                                 │ │
│  │    'appointment_create': false                        │ │
│  │  }                                                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
              │                     │                    │
              │                     │                    │
              ▼                     ▼                    ▼
      ┌──────────────┐     ┌──────────────┐    ┌──────────────┐
      │ Component A  │     │ Component B  │    │ Component C  │
      │              │     │              │    │              │
      │ isLoading =  │     │ isLoading =  │    │ anyLoading = │
      │   clients_   │     │   pets_list  │    │   true       │
      │   list       │     │              │    │              │
      └──────────────┘     └──────────────┘    └──────────────┘

Each component can:
  - Subscribe to specific loading keys
  - Show/hide spinner based on loading state
  - Check if any operation is loading globally
  - Display section-specific loading indicators
```

## Cache Strategy Visualization

```
Time: 0min          5min         10min         15min
      │             │             │             │
      ▼             ▼             ▼             ▼
      
API Call ────────────────────────────────────────────▶
[GET /clients]
      │
      ▼
Cache Stored (TTL: 10min)
[clients_all] ══════════════════════════════╗
      │                                     ║ Valid Cache
      ├─ Request 2 (1min) ─▶ FROM CACHE ◀──╣
      ├─ Request 3 (3min) ─▶ FROM CACHE ◀──╣
      ├─ Request 4 (7min) ─▶ FROM CACHE ◀──╣
      │                                     ║
      └───────────────────────────────────────╝
                                            │
                            Cache Expired ──┘
                                            │
Request 5 (11min) ───▶ NEW API CALL ───────┘
[GET /clients]
      │
      ▼
Cache Refreshed (TTL: 10min)
[clients_all] ══════════════════════════════╗
                                            ║ Valid Cache
                                            ║
                                            ▼

Result: 4 API calls saved out of 5 requests (80% reduction)
```

## Component Lifecycle with State Management

```
Component Initialization
      │
      ▼
ngOnInit() called
      │
      ├─▶ Subscribe to service.items$
      │   └─▶ Components gets latest data
      │       └─▶ Updates local property
      │
      ├─▶ Subscribe to loadingService.getLoading$('key')
      │   └─▶ Component gets loading state
      │       └─▶ Shows/hides spinner
      │
      ├─▶ Subscribe to service.state$
      │   └─▶ Component gets full state
      │       └─▶ Handles errors
      │
      └─▶ service.getAllItems()
          └─▶ Triggers data load (uses cache if available)
              └─▶ Observables emit values
                  └─▶ Subscriptions update UI
      
Component Active
      │
      ├─▶ User searches locally
      │   └─▶ No API call
      │       └─▶ Instant results
      │
      ├─▶ User refreshes
      │   └─▶ forceRefresh=true
      │       └─▶ New API call
      │           └─▶ Cache updated
      │               └─▶ All subscribers notified
      │
      └─▶ Another component creates item
          └─▶ Service invalidates cache
              └─▶ Service updates BehaviorSubject
                  └─▶ THIS component auto-updates
                      └─▶ UI refreshes automatically

Component Destroyed
      │
      ▼
ngOnDestroy() called
      │
      └─▶ destroy$.next()
          └─▶ All subscriptions cleaned up
              └─▶ No memory leaks
```

## Benefits Visualization

### Without State Management (Before)

```
Component A          Component B          Component C
     │                    │                    │
     │ GET /clients       │ GET /clients       │ GET /clients
     ├───────────▶        ├───────────▶        ├───────────▶
     │ [500ms]            │ [500ms]            │ [500ms]
     │                    │                    │
     │ Search             │                    │
     ├───────────▶        │                    │
     │ GET /clients?q=... │                    │
     │ [500ms]            │                    │
     │                    │                    │
     │                    │ Create Client      │
     │                    ├───────────▶        │
     │                    │ POST /clients      │
     │ ❌ Stale data      │                    │ ❌ Stale data
     
Total: 5 API calls
Total Time: 2500ms
Issues: Stale data, no coordination, redundant calls
```

### With State Management (After)

```
Component A          Component B          Component C
     │                    │                    │
     │ GET /clients       │                    │
     ├───────────▶        │                    │
     │ [500ms]            │                    │
     │ Cache ✓            │ FROM CACHE ✓       │ FROM CACHE ✓
     │ [0ms]              │ [0ms]              │ [0ms]
     │                    │                    │
     │ Search (local)     │                    │
     │ [instant]          │                    │
     │ [0ms]              │                    │
     │                    │                    │
     │                    │ Create Client      │
     │                    ├───────────▶        │
     │                    │ POST /clients      │
     │ ✓ Auto-update      │ State sync         │ ✓ Auto-update
     
Total: 2 API calls (60% reduction)
Total Time: 500ms (80% faster)
Benefits: Fresh data everywhere, coordinated, efficient
```

---

**Key Points:**
- Single source of truth in services
- All components stay synchronized automatically
- Intelligent caching reduces API calls by 60-80%
- Loading states provide better UX
- Local operations (search, filter) have zero latency
- Automatic cleanup prevents memory leaks
