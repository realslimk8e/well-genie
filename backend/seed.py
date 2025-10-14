"""
Database seeding script for WellGenie
Run this to populate your database with sample data for testing
"""
from datetime import date, timedelta
from sqlmodel import Session, select
from app.database import engine
from app.models import SleepEntry, DietEntry, ExerciseEntry, SQLModel


def create_tables():
    """Create all database tables"""
    print("Creating tables...")
    SQLModel.metadata.create_all(engine)
    print("✅ Tables created")


def clear_existing_data(session: Session):
    """Clear all existing data from tables"""
    print("\nClearing existing data...")
    
    # Delete all entries
    for entry in session.exec(select(SleepEntry)).all():
        session.delete(entry)
    for entry in session.exec(select(DietEntry)).all():
        session.delete(entry)
    for entry in session.exec(select(ExerciseEntry)).all():
        session.delete(entry)
    
    session.commit()
    print("✅ Existing data cleared")


def seed_sleep_data(session: Session):
    """Seed sleep entries for the past 30 days"""
    print("\nSeeding sleep data...")
    
    sleep_qualities = ["excellent", "good", "fair", "poor"]
    base_date = date.today() - timedelta(days=30)
    
    sleep_entries = []
    for i in range(30):
        entry_date = base_date + timedelta(days=i)
        
        # Vary sleep hours between 5.5 and 9 hours
        hours = 7.0 + (i % 4) * 0.5 - 1.0
        quality = sleep_qualities[i % len(sleep_qualities)]
        
        entry = SleepEntry(
            date=entry_date,
            hours=hours,
            quality=quality
        )
        sleep_entries.append(entry)
        session.add(entry)
    
    session.commit()
    print(f"✅ Added {len(sleep_entries)} sleep entries")


def seed_diet_data(session: Session):
    """Seed diet entries for the past 30 days"""
    print("\nSeeding diet data...")
    
    base_date = date.today() - timedelta(days=30)
    
    diet_entries = []
    for i in range(30):
        entry_date = base_date + timedelta(days=i)
        
        # Vary calories between 1800 and 2500
        calories = 2000 + (i % 10) * 50
        protein_g = 120 + (i % 8) * 10
        carbs_g = 200 + (i % 12) * 15
        fat_g = 60 + (i % 6) * 5
        
        entry = DietEntry(
            date=entry_date,
            calories=float(calories),
            protein_g=float(protein_g),
            carbs_g=float(carbs_g),
            fat_g=float(fat_g)
        )
        diet_entries.append(entry)
        session.add(entry)
    
    session.commit()
    print(f"✅ Added {len(diet_entries)} diet entries")


def seed_exercise_data(session: Session):
    """Seed exercise entries for the past 30 days"""
    print("\nSeeding exercise data...")
    
    base_date = date.today() - timedelta(days=30)
    
    exercise_entries = []
    for i in range(30):
        entry_date = base_date + timedelta(days=i)
        
        # Vary steps between 5000 and 15000
        steps = 8000 + (i % 15) * 500
        duration_min = 30 + (i % 8) * 10
        calories_burned = 200 + (i % 10) * 50
        
        entry = ExerciseEntry(
            date=entry_date,
            steps=steps,
            duration_min=float(duration_min),
            calories_burned=float(calories_burned)
        )
        exercise_entries.append(entry)
        session.add(entry)
    
    session.commit()
    print(f"✅ Added {len(exercise_entries)} exercise entries")


def verify_data(session: Session):
    """Verify the seeded data"""
    print("\n" + "="*50)
    print("DATA VERIFICATION")
    print("="*50)
    
    sleep_count = len(session.exec(select(SleepEntry)).all())
    diet_count = len(session.exec(select(DietEntry)).all())
    exercise_count = len(session.exec(select(ExerciseEntry)).all())
    
    print(f"Sleep entries: {sleep_count}")
    print(f"Diet entries: {diet_count}")
    print(f"Exercise entries: {exercise_count}")
    
    # Show sample data
    print("\n📊 Sample Sleep Entries:")
    for entry in session.exec(select(SleepEntry).limit(3)).all():
        print(f"  {entry.date}: {entry.hours}h - {entry.quality}")
    
    print("\n🍎 Sample Diet Entries:")
    for entry in session.exec(select(DietEntry).limit(3)).all():
        print(f"  {entry.date}: {entry.calories} cal, {entry.protein_g}g protein")
    
    print("\n🏃 Sample Exercise Entries:")
    for entry in session.exec(select(ExerciseEntry).limit(3)).all():
        print(f"  {entry.date}: {entry.steps} steps, {entry.duration_min} min")


def main(clear_data: bool = None):
    """
    Main seeding function
    
    Args:
        clear_data: If True, clear existing data. If None, prompt user.
    """
    print("="*50)
    print("🌱 WellGenie Database Seeding")
    print("="*50)
    
    # Create tables
    create_tables()
    
    # Seed data
    with Session(engine) as session:
        # Check if there's existing data
        existing_sleep = len(session.exec(select(SleepEntry)).all())
        existing_diet = len(session.exec(select(DietEntry)).all())
        existing_exercise = len(session.exec(select(ExerciseEntry)).all())
        total_existing = existing_sleep + existing_diet + existing_exercise
        
        if total_existing > 0:
            print(f"\n⚠️  Found existing data:")
            print(f"   - Sleep entries: {existing_sleep}")
            print(f"   - Diet entries: {existing_diet}")
            print(f"   - Exercise entries: {existing_exercise}")
            
            # Determine if we should clear
            should_clear = clear_data
            if should_clear is None:
                response = input("\n🗑️  Clear existing data? (y/n): ").lower()
                should_clear = response == 'y'
            
            if should_clear:
                clear_existing_data(session)
            else:
                print("⚠️  Keeping existing data. New data will be added.")
        
        # Seed all data
        seed_sleep_data(session)
        seed_diet_data(session)
        seed_exercise_data(session)
        
        # Verify
        verify_data(session)
    
    print("\n" + "="*50)
    print("✅ Seeding complete!")
    print("="*50)


if __name__ == "__main__":
    main()