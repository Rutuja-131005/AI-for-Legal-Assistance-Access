import { SampleContract } from '../types';

export const SAMPLE_CONTRACTS: SampleContract[] = [
  {
    id: 'residential-lease-trap',
    title: 'Residential Lease Agreement (Landlord-Biased)',
    category: 'residential_lease',
    description: 'Common urban apartment lease containing hidden fees, entry without notice, non-refundable deposit terms, and unilateral maintenance burdens.',
    badge: 'High Risk • 6 Red Flags',
    riskLevel: 'critical',
    suggestedQuestions: [
      'Can the landlord enter my apartment without advance notice?',
      'Under what conditions is my security deposit non-refundable?',
      'What happens if I need to break the lease early due to job relocation?',
      'Who is responsible for plumbing and appliance repairs?'
    ],
    rawText: `RESIDENTIAL LEASE AGREEMENT

This Residential Lease Agreement ("Agreement") is made and entered into as of this 1st day of October, 2024, by and between Skyline Real Estate Holdings LLC ("Landlord"), and Riya Sharma ("Tenant").

1. PREMISES AND TERM
Landlord hereby leases to Tenant the premises located at Apt 4B, 742 Evergreen Terrace, Springfield ("Premises"), for a fixed term of twelve (12) months, commencing October 1, 2024 and terminating September 30, 2025.

2. AUTOMATIC RENEWAL AND NOTICE
This Lease shall automatically renew for successive one-year terms at a 15% rent increase unless Tenant provides written notice of intent to vacate via certified registered mail exactly ninety (90) days prior to the expiration date. Notice provided eighty-nine (89) days or less prior to expiration shall be deemed null and void, and Tenant shall be bound for the subsequent 12-month period.

3. RENT AND LATE CHARGES
Tenant agrees to pay monthly rent of $2,450.00, due promptly on the first (1st) day of each calendar month. If rent is not received by 11:59 PM on the 2nd day of the month, a mandatory late penalty fee of $250.00 shall be assessed immediately, plus an additional recurring charge of $30.00 per day until all outstanding arrears are satisfied in full.

4. SECURITY DEPOSIT AND DEDUCTIONS
Tenant shall deposit with Landlord the sum of $4,900.00 (equivalent to two months' rent) as a security deposit. A non-refundable refurbishment and administrative turnover fee of $850.00 shall be deducted automatically upon move-out regardless of property condition. Landlord shall have up to sixty (60) days following surrender of premises to return any remaining balance.

5. LANDLORD RIGHT OF ENTRY
Landlord and Landlord's agents, contractors, or prospective purchasers shall have the unencumbered right to enter the Premises at any time, day or night, with or without prior oral or written notice, for purposes of inspection, routine maintenance, aesthetic evaluation, or showing the unit.

6. MAINTENANCE AND REPAIRS
Tenant agrees to accept the Premises strictly "AS IS". Tenant shall bear sole financial responsibility for all maintenance, plumbing clogs, heating/AC filter replacements, water heater repairs, and appliance maintenance exceeding $50.00 per incident, regardless of whether damage resulted from ordinary wear and tear or pre-existing mechanical failure.

7. GUESTS AND OCCUPANCY LIMITS
No overnight guests are permitted to remain on the Premises for more than three (3) consecutive nights or a cumulative total of seven (7) days per calendar year without prior written authorization from Landlord. Any unauthorized overnight stay shall incur a surcharge of $75.00 per guest per night.

8. EARLY TERMINATION AND LIQUIDATED DAMAGES
In the event Tenant vacates or terminates this Lease prior to the expiration of the initial term for any reason whatsoever (including military deployment, illness, or job relocation), Tenant shall remain liable for all remaining rent payments due through September 30, 2025, in addition to an immediate liquidated damages buyout fee of $5,000.00.

9. WAIVER OF JURY TRIAL AND CLASS ACTION
Tenant explicitly waives all constitutional rights to a trial by jury and agrees that any disputes arising from this Agreement shall be resolved through binding individual arbitration administered solely by an arbitrator selected exclusively by Landlord. Tenant waives all rights to join, initiate, or participate in any class or collective actions.

10. GOVERNING LAW AND ATTORNEYS' FEES
This Agreement shall be governed by the laws of the State. In the event of any legal dispute or collection action, Tenant agrees to indemnify Landlord and reimburse all of Landlord's attorneys' fees and legal costs, regardless of which party prevails in the adjudication.`,
    counterOfferText: `RESIDENTIAL LEASE AGREEMENT (TENANT COUNTER-PROPOSAL)

This Residential Lease Agreement ("Agreement") is made and entered into as of October 1, 2024, by and between Skyline Real Estate Holdings LLC ("Landlord"), and Riya Sharma ("Tenant").

1. PREMISES AND TERM
Landlord leases to Tenant Apt 4B, 742 Evergreen Terrace for a fixed term of twelve (12) months, commencing October 1, 2024 and ending September 30, 2025.

2. RENEWAL AND NOTICE
Upon expiration, this Lease shall convert to a month-to-month tenancy unless either party provides thirty (30) days written notice of termination. Any proposed rent increase upon renewal shall not exceed 3% or local CPI guidelines, with at least 60 days advance written notice.

3. RENT AND REASONABLE GRACE PERIOD
Monthly rent is $2,450.00, due on the first day of each month. A five (5) day grace period shall apply. If rent is unpaid after the 5th day, a reasonable one-time late fee of $50.00 may be assessed.

4. SECURITY DEPOSIT PROTECTIONS
Tenant shall provide a security deposit of $2,450.00 (one month's rent) held in an interest-bearing escrow account. The deposit is 100% refundable, less documented damages beyond reasonable wear and tear. No mandatory turnover fees shall apply. Balance with itemized accounting shall be returned within 21 days of move-out.

5. LANDLORD ENTRY NOTICE
Except in active emergencies (fire, flooding), Landlord must provide at least twenty-four (24) hours advance written notice prior to entry, with entry restricted to reasonable business hours (9:00 AM - 6:00 PM).

6. HABITABILITY AND REPAIRS
Landlord remains responsible for maintaining the structural elements, heating, ventilation, plumbing, and major appliances in clean working order in compliance with state habitability standards. Tenant is responsible solely for keeping the interior clean and repairing damages caused by Tenant negligence.

7. GUEST POLICY
Tenant may host casual social and overnight guests for up to fourteen (14) consecutive days or thirty (30) days per calendar year without requiring prior notice or fees.

8. EARLY TERMINATION
Tenant may terminate early upon sixty (60) days advance written notice and payment of an early lease break fee capped at two (2) months' rent, releasing Tenant from further liability once new tenancy commences.

9. DISPUTE RESOLUTION
Disputes may be brought in local municipal small claims court or resolved via mutual mediation. Each party shall bear their own legal expenses unless determined otherwise by a presiding court.`
  },
  {
    id: 'freelance-contractor-agreement',
    title: 'Independent Contractor Agreement (Agency-Favoring)',
    category: 'independent_contractor',
    description: 'Freelance design & engineering agreement featuring Net-90 delayed payments, unlimited indemnification, perpetual non-compete, and broad IP grab.',
    badge: 'Extreme Risk • 5 Red Flags',
    riskLevel: 'critical',
    suggestedQuestions: [
      'When and how will I actually get paid for completed milestones?',
      'Does the client own my pre-existing tools, libraries, or portfolio pieces?',
      'Does the non-compete prevent me from working with other clients in my industry?',
      'What are my liabilities if the project is delayed or buggy?'
    ],
    rawText: `INDEPENDENT CONTRACTOR SERVICES AGREEMENT

This Agreement is entered into on November 15, 2024, by and between Apex Media Labs Inc. ("Company") and Jordan Lee ("Contractor").

1. SERVICES AND DELIVERABLES
Contractor agrees to perform product design and frontend software development services as specified in Statements of Work issued periodically by Company.

2. PAYMENT TERMS (NET-90)
Company shall pay Contractor an agreed fee upon satisfactory completion of Deliverables. Invoices shall be submitted monthly. Company shall remit payment within ninety (90) days of receiving an invoice ("Net-90"), subject to Company's sole discretion and subjective approval of the deliverables.

3. UNCONDITIONAL INTELLECTUAL PROPERTY ASSIGNMENT
Contractor irrevocably transfers, conveys, and assigns to Company all worldwide right, title, and interest in and to all work product, designs, code, scripts, techniques, methodologies, whether developed during or outside working hours, including all background code, design systems, and pre-existing digital assets utilized in the services. Contractor waives all moral rights and agrees never to showcase the project in Contractor's personal portfolio.

4. UNLIMITED INDEMNIFICATION AND LIABILITY
Contractor shall defend, indemnify, and hold harmless Company, its officers, affiliates, and customers from and against ANY and all claims, damages, losses, expenses, or attorney fees arising out of the services, regardless of fault. Contractor's liability under this Agreement shall be unlimited in amount and scope.

5. NON-COMPETITION AND CLIENT RESTRICTIONS
During the term of this Agreement and for a period of twenty-four (24) months following termination for any reason, Contractor shall not directly or indirectly provide software engineering, UI/UX design, or consulting services to any entity operating in digital media, SaaS, advertising, or technology anywhere in North America.

6. UNILATERAL TERMINATION WITHOUT COMPENSATION
Company reserves the right to terminate this Agreement or any pending Statement of Work at any moment, with immediate effect and without cause. Upon termination, Company shall owe Contractor no further compensation, regardless of work completed to date.`
  },
  {
    id: 'employment-ip-noncompete',
    title: 'Employment Offer Letter & Confidentiality / IP Agreement',
    category: 'employment_agreement',
    description: 'Tech worker employment terms containing aggressive moonlighting restrictions, weekend side-project assignment, and broad non-solicitation.',
    badge: 'Moderate Caution • 4 Red Flags',
    riskLevel: 'warning',
    suggestedQuestions: [
      'Do I own side projects and apps I code on weekends on my own computer?',
      'What are the restrictions on moonlighting or freelance consulting?',
      'What happens to my unvested equity if I am terminated without cause?'
    ],
    rawText: `EMPLOYMENT AND PROPRIETARY INFORMATION AGREEMENT

This Agreement is entered into by NextGen Innovations Corp ("Employer") and Alex Chen ("Employee").

1. AT-WILL EMPLOYMENT AND DUTIES
Employee is employed as Senior Software Engineer on an at-will basis. Employer may terminate Employee's employment at any time, with or without cause or advance notice.

2. EXCLUSIVE FULL-TIME COMMITMENT & MOONLIGHTING BAN
Employee agrees to devote 100% of their business time, attention, and effort exclusively to the business of Employer. Employee shall not engage in any outside employment, freelance consulting, open-source maintainership, advisory roles, or personal commercial software development, whether paid or unpaid, during the term of employment.

3. COMPREHENSIVE INVENTIONS ASSIGNMENT
All inventions, software, trade secrets, patents, copyrightable works, and ideas conceived, developed, or reduced to practice by Employee—whether during regular office hours or on weekends/evenings, whether on Employer's equipment or Employee's personal laptop—shall belong exclusively and perpetually to Employer.

4. POST-EMPLOYMENT RESTRICTIONS
For twelve (12) months following separation, Employee agrees not to solicit or hire any employees, contractors, or customers of Employer, nor perform services for any direct competitor within a 100-mile radius.

5. MANDATORY BINDING ARBITRATION & FEE-SHIFTING
All disputes, wage claims, or wrongful termination claims must be settled via private arbitration. In the event Employee does not prevail on every claim, Employee shall reimburse Employer for all defense legal expenses and arbitration filing costs.`
  },
  {
    id: 'consumer-saas-terms',
    title: 'Consumer Cloud App Terms of Service & Privacy Policy',
    category: 'terms_of_service',
    description: 'Typical online subscription contract with unilateral fee changes, perpetual user content licensing, waiver of chargebacks, and forced arbitration.',
    badge: 'Moderate Caution • 3 Red Flags',
    riskLevel: 'warning',
    suggestedQuestions: [
      'Can the company change subscription prices or features without my consent?',
      'Does the company own or license the photos and files I upload?',
      'Can I get a prorated refund if the service goes down or I cancel?'
    ],
    rawText: `CLOUDSTORAGE & AI SUITE TERMS OF SERVICE

Welcome to CloudSync Pro ("Service"), operated by OmniData Global Inc. ("OmniData"). By clicking "Accept" or using the Service, you agree to these Terms.

1. SUBSCRIPTION FEES AND BILLING
Subscriptions automatically bill every 30 days. All payments are non-refundable under all circumstances, including service outages, data corruption, or premature cancellation. Users expressly waive all rights to dispute charges or initiate credit card chargebacks.

2. UNILATERAL MODIFICATIONS TO TERMS AND PRICING
OmniData reserves the right to modify these Terms, subscription fees, or feature availability at any time without individual notice. Continued use of the platform constitutes binding acceptance of modified terms.

3. USER CONTENT & PERPETUAL GLOBAL LICENSE
By uploading or processing text, images, or documents through our Service, you grant OmniData a worldwide, perpetual, irrevocable, royalty-free, sublicensable license to use, display, modify, and train proprietary machine learning and AI models on your submitted content.

4. DISCLAIMER OF WARRANTIES AND LIMITATION OF LIABILITY
The Service is provided "AS IS" without warranties of any kind. OmniData's aggregate liability for any data breach, loss of files, or privacy leak shall be strictly capped at the lesser of $10.00 or the amount paid by you in the preceding calendar month.

5. CLASS ACTION WAIVER AND MANDATORY ARBITRATION
You agree that any dispute must be brought in your individual capacity, and waive any right to participate as a plaintiff or class member in any class action lawsuit.`
  }
];
