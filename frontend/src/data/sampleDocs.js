export const SAMPLE_DOCUMENTS = [
  {
    id: 'rental-bengaluru',
    title: 'Residential Rental Agreement',
    subtitle: 'Flat 402, Indiranagar, Bengaluru (11 Months)',
    category: 'Residential Rental Agreement',
    icon: 'Home',
    filename: 'residential_rental_agreement.txt',
    text: `RESIDENTIAL TENANCY AGREEMENT

THIS LEASE AGREEMENT is entered into on this 1st day of October, 2026, by and between:
LANDLORD: Mr. Suresh Kumar, residing at HSR Layout, Bengaluru, Karnataka ("Landlord")
AND
TENANT: Ms. Riya Sharma, residing at Koramangala, Bengaluru, Karnataka ("Tenant").

1. PREMISES AND TERM
1.1 The Landlord agrees to lease the premises situated at Flat 402, Greenview Apartments, Indiranagar, Bengaluru to the Tenant for a period of 11 (eleven) months commencing from 1st October 2026.
1.2 LOCK-IN PERIOD: Both parties agree to a mandatory Lock-in Period of 6 (six) months. If the Tenant vacates the premises prior to the completion of the Lock-in Period, the Tenant shall forfeit the entire Security Deposit and remain liable for the rent for the remaining lock-in period.

2. RENT AND SECURITY DEPOSIT
2.1 MONTHLY RENT: The Tenant agrees to pay a monthly rent of INR 35,000/- (Rupees Thirty-Five Thousand only), payable on or before the 5th day of each calendar month.
2.2 LATE PAYMENT PENALTY: Any delay in payment beyond the 5th of the month shall attract a late penalty charge of INR 500 per day until payment is cleared.
2.3 SECURITY DEPOSIT: The Tenant shall deposit an interest-free refundable Security Deposit of INR 3,50,000/- (Rupees Three Lakhs Fifty Thousand only, equal to 10 months rent) upon signing this agreement.
2.4 DEPOSIT DEDUCTIONS: Upon termination, the Landlord reserves the absolute right to deduct 1 (one) full month's rent (INR 35,000) for mandatory painting and deep cleaning fees regardless of the condition of the flat, plus any cost of repairs deemed necessary by the Landlord.

3. ANNUAL RENT ESCALATION
3.1 In the event of renewal of this agreement after 11 months, the monthly rent shall automatically increase by 12% (twelve percent) per annum over the previous rent rate.

4. MAINTENANCE AND USAGE
4.1 The Tenant shall pay monthly apartment association maintenance charges of INR 4,500 directly to the Resident Welfare Association.
4.2 The Tenant shall not make any structural alterations, paint walls, or drive nails into walls without prior written consent from the Landlord.

5. TERMINATION AND NOTICE PERIOD
5.1 Post completion of the Lock-in Period, either party may terminate this agreement by giving 2 (two) months' prior written notice or paying 2 months' rent in lieu thereof.
5.2 The Landlord may terminate this agreement immediately with 24 hours' notice if the Tenant engages in illegal activities or breaches any terms herein.`,
    classification: {
      documentType: 'Residential Rental Agreement',
      confidence: 0.98,
      detectedParties: ['Suresh Kumar (Landlord)', 'Riya Sharma (Tenant)'],
      effectiveDate: '1st October 2026',
      jurisdiction: 'Bengaluru, Karnataka'
    },
    summary: {
      executiveSummary: 'This is an 11-month Residential Tenancy Agreement for a flat in Indiranagar, Bengaluru. It imposes a strict 6-month lock-in period, a 10-month security deposit (INR 3.5 Lakhs), and an automatic 12% annual rent increase upon renewal. It includes a 1-month mandatory painting deduction regardless of flat condition.',
      keyMetrics: [
        { label: 'Monthly Rent', value: 'INR 35,000', impact: 'Standard Obligation' },
        { label: 'Security Deposit', value: 'INR 3,50,000 (10 Months)', impact: 'High Financial Obligation' },
        { label: 'Lock-in Period', value: '6 Months Mandatory', impact: 'High Exit Risk' },
        { label: 'Annual Escalation', value: '12% per annum', impact: 'Financial Risk' }
      ],
      clauses: [
        {
          clauseId: '1.2',
          title: 'Mandatory Lock-in Period',
          originalText: 'LOCK-IN PERIOD: Both parties agree to a mandatory Lock-in Period of 6 (six) months. If the Tenant vacates prior to completion, the Tenant shall forfeit the entire Security Deposit...',
          simplifiedText: 'You cannot leave the house during the first 6 months. If you move out early, the landlord will take your entire INR 3,50,000 security deposit.',
          tag: 'HIGH RISK',
          reason: 'Leaving before the 6-month lock-in period may trigger an early-termination financial obligation. Check the agreement for the exact amount or penalty applicable.'
        },
        {
          clauseId: '2.4',
          title: 'Mandatory Painting & Cleaning Deduction',
          originalText: 'Upon termination, the Landlord reserves the absolute right to deduct 1 (one) full month\'s rent (INR 35,000) for mandatory painting...',
          simplifiedText: 'When you move out, the landlord will automatically deduct INR 35,000 from your deposit for painting, even if the walls are perfectly clean.',
          tag: 'HIGH RISK',
          reason: '1 full month rent (INR 35,000) will be automatically deducted from your security deposit upon move out.'
        },
        {
          clauseId: '3.1',
          title: 'Annual Rent Escalation',
          originalText: 'In the event of renewal after 11 months, monthly rent shall automatically increase by 12% per annum...',
          simplifiedText: 'If you renew the agreement next year, your rent will jump from INR 35,000 to INR 39,200 per month.',
          tag: 'OBLIGATION',
          reason: 'Your monthly rent would increase by ₹4,200, from ₹35,000 to ₹39,200, if the 12% escalation applies at renewal.'
        },
        {
          clauseId: '5.1',
          title: 'Notice Period After Lock-in',
          originalText: 'Post completion of Lock-in Period, either party may terminate by giving 2 months written notice...',
          simplifiedText: 'After the initial 6 months, you must inform the landlord 2 months in advance before moving out.',
          tag: 'STANDARD',
          reason: 'Requires providing 2 full calendar months of advance written notice prior to vacating.'
        }
      ]
    },
    checklist: {
      verifyItems: [
        'Verify landlord ownership title deeds / landlord identity before paying deposit',
        'Inspect flat physical condition and create a signed inventory document',
        'Verify maintenance bill receipt history with Resident Welfare Association'
      ],
      negotiateItems: [
        'Request reducing 10-month deposit (INR 3,50,000) to standard 5-6 months',
        'Negotiate removing mandatory 1-month rent deduction for painting',
        'Cap annual rent escalation at 5-7% instead of 12%'
      ],
      lawyerItems: [
        'Seek advice on forfeit of entire deposit if vacating during lock-in period',
        'Check local Karnataka Rent Control Act protections regarding security deposit returns'
      ]
    }
  },
  {
    id: 'job-tech-offer',
    title: 'Senior Engineer Job Offer',
    subtitle: 'Apex Digital Technologies (CTC 22 LPA, Bengaluru)',
    category: 'Employment Offer & Service Agreement',
    icon: 'Briefcase',
    filename: 'tech_employment_offer.txt',
    text: `CONFIDENTIAL EMPLOYMENT OFFER & SERVICE AGREEMENT

Date: October 15, 2026
Candidate Name: Riya Sharma
Position: Senior Full-Stack Engineer

1. REMUNERATION & COMPENSATION STRUCTURE
1.1 Total Fixed CTC: INR 22,00,000/- per annum.
1.2 Joining Bonus: INR 2,00,000/-. Refundable if resigning within 18 months.

2. NOTICE PERIOD & RESIGNATION
2.1 Mandatory Notice Period: 90 (ninety) days written notice period prior to resignation.

3. NON-COMPETE & RESTRICTIVE COVENANTS
3.1 Non-Compete: 12 months post-employment non-compete across South Asia.`,
    classification: {
      documentType: 'Employment Offer & Service Agreement',
      confidence: 0.96,
      detectedParties: ['Apex Digital Technologies Pvt. Ltd.', 'Riya Sharma'],
      effectiveDate: 'October 15, 2026',
      jurisdiction: 'Bengaluru, India'
    },
    summary: {
      executiveSummary: 'This is a Senior Engineer Employment Offer from Apex Digital Technologies. It features a fixed CTC of 22 LPA with a discretionary performance bonus and a 90-day mandatory notice period, along with a strict 12-month post-employment non-compete clause.',
      keyMetrics: [
        { label: 'Fixed CTC', value: 'INR 22,00,000 / year', impact: 'Favorable' },
        { label: 'Notice Period', value: '90 Days Mandatory', impact: 'High Obligation' },
        { label: 'Joining Bonus Refund', value: 'INR 2,00,000 (18 Mo Lock)', impact: 'Obligation Risk' },
        { label: 'Non-Compete', value: '12 Months Post-Exit', impact: 'High Legal Risk' }
      ],
      clauses: [
        {
          clauseId: '2.1',
          title: '90-Day Mandatory Notice Period',
          originalText: 'The Employee must serve a mandatory 90 (ninety) days written notice period prior to resignation...',
          simplifiedText: 'If you want to resign, you must work for 3 full months after submitting your resignation.',
          tag: 'HIGH RISK',
          reason: 'A 90-day notice period requires 3 months of advance notice before contract termination.'
        },
        {
          clauseId: '3.1',
          title: '12-Month Non-Compete Clause',
          originalText: 'For 12 months post termination, Employee agrees not to accept employment with any competing entity in South Asia...',
          simplifiedText: 'You agree not to work for any competitor in South Asia for 1 year after leaving this company.',
          tag: 'HIGH RISK',
          reason: 'This clause restricts taking employment with direct industry competitors for 12 months after termination.'
        }
      ]
    },
    checklist: {
      verifyItems: [
        'Confirm fixed vs variable component breakdown in salary structure',
        'Check medical insurance coverage details for dependents'
      ],
      negotiateItems: [
        'Request reducing notice period from 90 days to 60 days',
        'Negotiate reducing joining bonus clawback period from 18 months to 12 months'
      ],
      lawyerItems: [
        'Consult legal professional regarding enforceability of the 12-month non-compete in India'
      ]
    }
  }
];
