import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
    MatTable
} from "@angular/material/table";
import {
    BehaviorSubject,
    catchError,
    combineLatest,
    forkJoin,
    map,
    Observable,
    startWith,
    Subject,
    switchMap, takeUntil
} from "rxjs";
import {AsyncPipe} from "@angular/common";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {MatSort, MatSortModule} from "@angular/material/sort";


export interface Character {
    name: string;
    gender: string;
    birth_year: string
    homeworld: string;
}

export interface CharacterWithPlanet extends Character {
    planet: PlanetInfo;
}


export interface PlanetInfo {
    name: string;
    climate: string;
    terrain: string;
    population: string;
}


@Component({
    selector: 'app-star-wars',
    standalone: true,
    imports: [
        MatTable,
        MatColumnDef,
        MatHeaderCell,
        MatHeaderCellDef,
        MatCell,
        MatCellDef,
        MatHeaderRow,
        MatHeaderRowDef,
        MatRow,
        MatRowDef,
        AsyncPipe,
        MatMenuTrigger,
        MatFormField,
        MatMenuItem,
        MatMenu,
        MatInput,
        ReactiveFormsModule,
        MatSortModule,

    ],
    template: `
        <div class="search-container">
          <mat-form-field appearance="outline">
           <h1>Test</h1>
            <input matInput [formControl]="searchControl" placeholder="Enter character name">
          </mat-form-field>
        </div>

        @if (error | async) {
            <div class="error-message">
                {{ error | async }}
            </div>
        }
        
        <div class="table-container">
            <table mat-table [dataSource]="(filteredCharacter$ | async) || []" 
                   matSort
                   (matSortChange)="sortData($event)"
                   class="mat-elevation-z8">

              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>No</th>
                <td mat-cell *matCellDef="let element; let i = index">{{ i + 1 }}</td>
              </ng-container>

              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
                <td mat-cell *matCellDef="let element">{{ element.name }}</td>
              </ng-container>

              <ng-container matColumnDef="gender">
                <th mat-header-cell *matHeaderCellDef>Gender</th>
                <td mat-cell *matCellDef="let element">{{ element.gender }}</td>
              </ng-container>


              <ng-container matColumnDef="birth_year">
                <th mat-header-cell *matHeaderCellDef>Birth Year</th>
                <td mat-cell *matCellDef="let element">{{ element.birth_year }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row (click)="loadPlanetDataAfterClick(row.homeworld)"
                  [matMenuTriggerFor]="menu"
                  *matRowDef="let row; columns: displayedColumns;"></tr>


              <mat-menu #menu="matMenu">
            <span mat-menu-item [disableRipple]="true" (click)="$event.stopPropagation()">
                <div mat-menu-item
                     [disableRipple]="true"
                     (click)="$event.stopPropagation()">
                  
                  <div class="menu-content">
                       <h3>Planet Info</h3>
                      @if (selectedPlanet$ | async; as planet) {
                          <p>Name: {{ planet.name }}</p>
                          <p>Climate: {{ planet.climate }}</p>
                          <p>Terrain: {{ planet.terrain }}</p>
                          <p>Population: {{ planet.population }}</p>
                      } @else {
                          <p class="loading-text">Loading planet info...</p>
                      }
                  </div>
                </div>
            </span>
              </mat-menu>
            </table>
        </div>

    `,

    styleUrl: './star-wars.component.css',
    styles: [
        `
          .search-container {
            max-width: 900px;
            margin: 20px auto;
            padding: 0 15px;   
           
            
            mat-form-field {
              width: 100%;
               
            }
          }
          
          .table-container {
            max-width: 900px;
            max-height:700px;
            margin: 20px auto;
            padding: 0 15px;
            overflow-x: auto;
          }

          .error-message {
              color: #f44336;
              text-align: center;
              padding: 16px;
              margin: 16px;
              border-radius: 4px;
          }
          
          .mat-mdc-menu-item:not([disabled]):hover {
            background-color: rgba(255, 255, 255, 0);
            cursor: default;
          }

          .mat-table {
            min-width: 600px;
          }

          .mat-header-cell,
          .mat-cell {
            padding: 12px 16px !important;
          }
          
          .menu-content {
            padding: 16px;
            min-width: 200px;

            h3 {
              margin: 0 0 12px 0;
              font-weight: 500;
              text-align: center;
            }

            p {
              margin: 8px 0;
              color: rgba(0, 0, 0, 0.87);
              border-bottom: 1px solid rgba(197, 165, 165, 0.87);
            } 
              
            .loading-text {
                  text-align: center;
                  color: rgba(0, 0, 0, 0.54);
            }
          }
          
          @media (max-width: 600px) {
            .table-container {
              padding: 0 8px;
            }

            .mat-header-cell,
            .mat-cell {
              padding: 8px 10px !important;
              font-size: 12px;
            }

            .hide-mobile {
              display: none;
            }
          }

          .mat-mdc-row {
            position: relative;
            cursor: pointer;
            transition: background-color 0.2s ease;

            &:hover {
              background-color: rgba(0, 0, 0, 0.04);
            }
          }

          .custom-menu.mat-mdc-menu-panel {
            max-width: 90vw;
            min-width: 250px;
          }
        `
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StarWarsComponent implements OnInit, OnDestroy {
    @ViewChild(MatSort) sort!: MatSort;

    private http = inject(HttpClient);
    private charactersData = new BehaviorSubject<CharacterWithPlanet[]>([])
    private url = 'https://swapi.info/api/people'
    private destroy$ = new Subject<void>();

    readonly displayedColumns = ['id', 'name', 'gender', 'birth_year']
    error = new BehaviorSubject<string>('')

    searchControl = new FormControl('')
    characters$ = this.charactersData.asObservable()
    selectedPlanet$: Observable<PlanetInfo> | undefined;



    filteredCharacter$ = combineLatest([
        this.characters$,
        this.searchControl.valueChanges.pipe(
            startWith(''),
            map(value => (value || '').toLowerCase())
        )
    ]).pipe(
        map(([characters, searchTerm]) => {
            if (!searchTerm) return characters;
            return characters.filter(character =>
                character.name.toLowerCase().includes(searchTerm)
            );
        }));


    ngOnInit() {
        this.loadDataCharacter()
    }

    ngOnDestroy(){
        this.destroy$.next()
        this.destroy$.complete()
    }

    private compare(a: string | number, b: string | number, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

    private getRandomIndex(max: number, count: number): number[] {
        const indexes = new Set<number>();

        while (indexes.size < count) {
            const randomNumber = Math.floor(Math.random() * max);
            indexes.add(randomNumber);
        }
        console.log(indexes)
        return Array.from(indexes)
    }


    loadDataCharacter() {
          this.http.get<CharacterWithPlanet[]>(`${this.url}`).pipe(
            switchMap((res: any ) => {
                const totalCount = res.length;
                const randomIndex = this.getRandomIndex(totalCount, 15);

                const character = randomIndex.
                map((index) => {
                        return this.http.get<CharacterWithPlanet>(res[index].url)
                    });
                return forkJoin(character)
            }),
              catchError((error: HttpErrorResponse) => {
                  const errorMessage = error.status === 404
                  ? "Character not found"
                      :"Failed to load character.";
                  this.error.next(errorMessage);
                  return [];
              }),
              takeUntil(this.destroy$)
        ).subscribe(character => {
          this.charactersData.next(character)
        })
    }

    loadPlanetDataAfterClick(homeworldURL: string) {
        this.selectedPlanet$ = this.http.get<PlanetInfo>(homeworldURL).pipe(
            catchError(() => {
                this.error.next('Failed to load planet data');
                return [];
            })
        )
    }


    sortData(event: any) {
        const data = (this.charactersData.value || []).slice();
        if (!event.active || event.direction === '') {
            this.charactersData.next(data);
            return;
        }

        const sorted = data.sort((a, b) => {
            const isAsc = event.direction === 'asc';
            switch (event.active) {
                case 'name':
                    return this.compare(a.name, b.name, isAsc);
                default:
                    return 0;
            }
        });

        this.charactersData.next(sorted);
    }

}
