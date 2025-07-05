import usDebt from '../data/us-debt.js';
import { generateValidationReport } from './dataValidation.js';

export function runDataValidation(): void {
    console.log('🔍 Running data validation...\n');
    
    const report = generateValidationReport(usDebt);
    console.log(report);
    
    console.log('✅ Validation complete. Check the report above for details.');
}

// Auto-run validation
runDataValidation();

export default runDataValidation;