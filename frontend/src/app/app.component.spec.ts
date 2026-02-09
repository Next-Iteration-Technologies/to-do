import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { StateService } from './services/state.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: any;
  let stateService: StateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    stateService = TestBed.inject(StateService);
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have the 'NodeFlow' title`, () => {
    expect(component.title).toEqual('NodeFlow');
  });

  it('should render title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('NodeFlow');
  });

  // Phase 3 Tests
  describe('Search Highlighting', () => {
    it('should set highlight query when search button clicked', () => {
      // Arrange
      component.searchQuery = 'milk';
      spyOn(stateService, 'setHighlightQuery');

      // Act
      component.onSearchClick();

      // Assert
      expect(stateService.setHighlightQuery).toHaveBeenCalledWith('milk');
    });

    it('should not set highlight for empty query', () => {
      // Arrange
      component.searchQuery = '   ';
      spyOn(stateService, 'setHighlightQuery');

      // Act
      component.onSearchClick();

      // Assert
      expect(stateService.setHighlightQuery).not.toHaveBeenCalled();
    });

    it('should clear highlight query when clear clicked', () => {
      // Arrange
      component.searchQuery = 'milk';
      spyOn(stateService, 'clearHighlightQuery');

      // Act
      component.clearSearch();

      // Assert
      expect(component.searchQuery).toBe('');
      expect(stateService.clearHighlightQuery).toHaveBeenCalled();
    });
  });
});
