
# Plan: Role-Based Project Assignment Enforcement Fix

## Problem Analysis

The current system has a **data mismatch** between legacy project types and new sector naming:

| Current Project Types | Required Sector Names |
|-----------------------|----------------------|
| `design` | `Web Development` |
| `content` | `Content Creation` |
| `general` | `Digital Marketing` |

When assigning a project with `project_type = "design"` to an employee with `sector = "Web Development"`, the comparison fails because the strings don't match.

Additionally:
- 2 employees (Praveen, Alex) have `NULL` sectors and cannot be assigned to any project
- No database constraint prevents invalid sector values from being stored

---

## Implementation Plan

### Step 1: Database Migration - Standardize Existing Data

Create a migration to:

1. **Update existing project types** to match the new sector naming convention:
   - `design` -> `Web Development`
   - `content` -> `Content Creation`  
   - `general` -> `Digital Marketing`

2. **Add CHECK constraint on projects.project_type** to enforce only the 3 allowed values:
   ```sql
   CHECK (project_type IN ('Web Development', 'Digital Marketing', 'Content Creation'))
   ```

3. **Add CHECK constraint on profiles.sector** to enforce only the 3 allowed values (for non-null values):
   ```sql
   CHECK (sector IS NULL OR sector IN ('Web Development', 'Digital Marketing', 'Content Creation'))
   ```

### Step 2: Update Employees with Missing Sectors

Since existing employees (Praveen, Alex) have `NULL` sectors, there are two approaches:

**Option A (Recommended)**: Set a default sector for existing employees without one. This allows them to be assigned immediately.

**Option B**: Leave as `NULL` - they remain unassignable until an admin updates their profile.

I will implement **Option A** and set existing non-admin users without sectors to `"Web Development"` as a default.

---

## Technical Details

### Database Migration SQL

```sql
-- Step 1: Update existing projects with legacy project_type values
UPDATE public.projects 
SET project_type = 'Web Development' 
WHERE project_type IN ('design', 'general');

UPDATE public.projects 
SET project_type = 'Content Creation' 
WHERE project_type = 'content';

-- Step 2: Update existing employees without sectors
UPDATE public.profiles 
SET sector = 'Web Development' 
WHERE sector IS NULL AND role != 'admin';

-- Step 3: Add CHECK constraint on projects.project_type
ALTER TABLE public.projects 
ADD CONSTRAINT projects_project_type_check 
CHECK (project_type IN ('Web Development', 'Digital Marketing', 'Content Creation'));

-- Step 4: Add CHECK constraint on profiles.sector
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_sector_check 
CHECK (sector IS NULL OR sector IN ('Web Development', 'Digital Marketing', 'Content Creation'));
```

### Files Changed

**No frontend code changes required** - the assignment logic in `AdminProjects.tsx` is already correct:
- Line 169: `if (selectedEmployee.sector !== selectedProject.project_type)` - this comparison will work once the data is aligned
- Line 437: `employees.filter((emp) => emp.sector === selectedProject?.project_type)` - the dropdown filter will show correct employees

---

## Data Impact Summary

| Table | Current State | After Migration |
|-------|--------------|-----------------|
| **projects** | `design`, `content`, `general` | `Web Development`, `Digital Marketing`, `Content Creation` |
| **profiles** | 2 employees with `NULL` sector | All non-admins have valid sector |

---

## Validation After Implementation

1. Admin can assign "Web Development" project to "Web Development" employee
2. Admin can assign "Digital Marketing" project to "Digital Marketing" employee  
3. Admin can assign "Content Creation" project to "Content Creation" employee
4. Mismatched assignments are blocked with validation error
5. New projects cannot be created with invalid sector values
6. New employees cannot be created with invalid sector values

---

## Constraints Preserved

- Zero UI changes
- Zero workflow changes
- Backend-only enforcement via database constraints
- Common Missions logic remains unchanged
- Credit calculation rules unchanged
