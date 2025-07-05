interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

interface DataEntry {
    year: number;
    spending?: number;
    adjustedSpending?: number;
    debt: number;
    adjustedDebt: number;
    gdp?: number;
    adjustedGdp?: number;
    inflationAdjuster?: number;
    debtGrowthRate?: number;
    population?: number;
}

export function validateDataset(data: DataEntry[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Sort data by year for sequential validation
    const sortedData = [...data].sort((a, b) => a.year - b.year);
    
    for (let i = 0; i < sortedData.length; i++) {
        const entry = sortedData[i];
        const year = entry.year;
        
        // 1. Required fields validation
        if (!entry.debt || entry.debt <= 0) {
            errors.push(`${year}: Missing or invalid debt value`);
        }
        
        if (!entry.adjustedDebt || entry.adjustedDebt <= 0) {
            errors.push(`${year}: Missing or invalid adjusted debt value`);
        }
        
        // 2. Inflation adjuster validation
        if (entry.inflationAdjuster && entry.debt && entry.adjustedDebt) {
            const expectedAdjustedDebt = Math.round(entry.debt / entry.inflationAdjuster);
            const actualAdjustedDebt = Math.round(entry.adjustedDebt);
            
            if (Math.abs(expectedAdjustedDebt - actualAdjustedDebt) > 5) {
                errors.push(`${year}: Inflation adjustment mismatch. Expected: ${expectedAdjustedDebt}, Actual: ${actualAdjustedDebt}`);
            }
        }
        
        // 3. GDP validation (if present)
        if (entry.gdp && entry.adjustedGdp && entry.inflationAdjuster) {
            const expectedAdjustedGdp = Math.round(entry.gdp / entry.inflationAdjuster);
            const actualAdjustedGdp = Math.round(entry.adjustedGdp);
            
            if (Math.abs(expectedAdjustedGdp - actualAdjustedGdp) > 5) {
                errors.push(`${year}: GDP inflation adjustment mismatch. Expected: ${expectedAdjustedGdp}, Actual: ${actualAdjustedGdp}`);
            }
        }
        
        // 4. Spending validation (if present)
        if (entry.spending && entry.adjustedSpending && entry.inflationAdjuster) {
            const expectedAdjustedSpending = Math.round(entry.spending / entry.inflationAdjuster);
            const actualAdjustedSpending = Math.round(entry.adjustedSpending);
            
            if (Math.abs(expectedAdjustedSpending - actualAdjustedSpending) > 5) {
                errors.push(`${year}: Spending inflation adjustment mismatch. Expected: ${expectedAdjustedSpending}, Actual: ${actualAdjustedSpending}`);
            }
        }
        
        // 5. Growth rate validation (if present and has previous year)
        if (i > 0 && entry.debtGrowthRate !== undefined) {
            const prevEntry = sortedData[i - 1];
            if (prevEntry.adjustedDebt && entry.adjustedDebt) {
                const expectedGrowthRate = ((entry.adjustedDebt - prevEntry.adjustedDebt) / prevEntry.adjustedDebt) * 100;
                const actualGrowthRate = entry.debtGrowthRate;
                
                if (Math.abs(expectedGrowthRate - actualGrowthRate) > 0.1) {
                    errors.push(`${year}: Growth rate mismatch. Expected: ${expectedGrowthRate.toFixed(2)}%, Actual: ${actualGrowthRate.toFixed(2)}%`);
                }
            }
        }
        
        // 6. Reasonable value ranges
        if (entry.debt && entry.debt > 100000) {
            warnings.push(`${year}: Debt value seems unusually high: ${entry.debt}B`);
        }
        
        if (entry.inflationAdjuster && (entry.inflationAdjuster < 0.1 || entry.inflationAdjuster > 5)) {
            warnings.push(`${year}: Inflation adjuster seems unusual: ${entry.inflationAdjuster}`);
        }
        
        if (entry.population && (entry.population < 200 || entry.population > 400)) {
            warnings.push(`${year}: Population seems unusual: ${entry.population}M`);
        }
        
        // 7. Debt-to-GDP ratio validation
        if (entry.debt && entry.gdp) {
            const debtToGdpRatio = (entry.debt / entry.gdp) * 100;
            if (debtToGdpRatio > 200) {
                warnings.push(`${year}: Very high debt-to-GDP ratio: ${debtToGdpRatio.toFixed(1)}%`);
            }
        }
        
        // 8. Year continuity validation
        if (i > 0) {
            const prevYear = sortedData[i - 1].year;
            if (entry.year - prevYear > 1) {
                warnings.push(`Gap in data: Missing years between ${prevYear} and ${entry.year}`);
            }
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

export function validateInflationAdjustments(data: DataEntry[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    for (const entry of data) {
        if (!entry.inflationAdjuster || entry.inflationAdjuster <= 0) {
            errors.push(`${entry.year}: Missing or invalid inflation adjuster`);
            continue;
        }
        
        // Base year (2000) should have adjuster of 1.0
        if (entry.year === 2000 && Math.abs(entry.inflationAdjuster - 1.0) > 0.01) {
            errors.push(`${entry.year}: Base year inflation adjuster should be 1.0, got ${entry.inflationAdjuster}`);
        }
        
        // Inflation adjusters should generally increase over time (with some exceptions)
        if (entry.year > 2000 && entry.inflationAdjuster < 1.0) {
            warnings.push(`${entry.year}: Inflation adjuster less than 1.0 for post-2000 year`);
        }
        
        if (entry.year < 2000 && entry.inflationAdjuster > 1.0) {
            warnings.push(`${entry.year}: Inflation adjuster greater than 1.0 for pre-2000 year`);
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

export function validateDataCompleteness(data: DataEntry[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const requiredFields = ['debt', 'adjustedDebt'];
    const recommendedFields = ['gdp', 'adjustedGdp', 'spending', 'adjustedSpending', 'population', 'inflationAdjuster'];
    
    for (const entry of data) {
        // Check required fields
        for (const field of requiredFields) {
            if (!(field in entry) || entry[field as keyof DataEntry] === undefined || entry[field as keyof DataEntry] === null) {
                errors.push(`${entry.year}: Missing required field: ${field}`);
            }
        }
        
        // Check recommended fields
        for (const field of recommendedFields) {
            if (!(field in entry) || entry[field as keyof DataEntry] === undefined || entry[field as keyof DataEntry] === null) {
                warnings.push(`${entry.year}: Missing recommended field: ${field}`);
            }
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

export function generateValidationReport(data: DataEntry[]): string {
    const overallValidation = validateDataset(data);
    const inflationValidation = validateInflationAdjustments(data);
    const completenessValidation = validateDataCompleteness(data);
    
    const allErrors = [
        ...overallValidation.errors,
        ...inflationValidation.errors,
        ...completenessValidation.errors
    ];
    
    const allWarnings = [
        ...overallValidation.warnings,
        ...inflationValidation.warnings,
        ...completenessValidation.warnings
    ];
    
    let report = `# Data Validation Report\n\n`;
    report += `**Dataset Size:** ${data.length} entries\n`;
    report += `**Year Range:** ${Math.min(...data.map(d => d.year))} - ${Math.max(...data.map(d => d.year))}\n\n`;
    
    if (allErrors.length === 0) {
        report += `## ✅ Validation Status: PASSED\n\n`;
        report += `All critical validation checks passed successfully.\n\n`;
    } else {
        report += `## ❌ Validation Status: FAILED\n\n`;
        report += `Found ${allErrors.length} critical errors that must be addressed.\n\n`;
        
        report += `### Critical Errors:\n`;
        for (const error of allErrors) {
            report += `- ${error}\n`;
        }
        report += `\n`;
    }
    
    if (allWarnings.length > 0) {
        report += `### Warnings (${allWarnings.length}):\n`;
        for (const warning of allWarnings) {
            report += `- ${warning}\n`;
        }
        report += `\n`;
    }
    
    // Summary statistics
    const yearsWithData = data.filter(d => d.debt && d.adjustedDebt).length;
    const yearsWithFullData = data.filter(d => 
        d.debt && d.adjustedDebt && d.gdp && d.adjustedGdp && 
        d.spending && d.adjustedSpending && d.population && d.inflationAdjuster
    ).length;
    
    report += `## Data Completeness Summary\n`;
    report += `- **Years with basic data:** ${yearsWithData}/${data.length}\n`;
    report += `- **Years with complete data:** ${yearsWithFullData}/${data.length}\n`;
    report += `- **Data completeness:** ${((yearsWithFullData / data.length) * 100).toFixed(1)}%\n\n`;
    
    return report;
}

export default {
    validateDataset,
    validateInflationAdjustments,
    validateDataCompleteness,
    generateValidationReport
};