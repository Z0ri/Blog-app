import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostSavingComponent } from './post-saving.component';

describe('PostSavingComponent', () => {
  let component: PostSavingComponent;
  let fixture: ComponentFixture<PostSavingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostSavingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostSavingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
