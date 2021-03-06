'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const outline = require('../../lib/utils/outline');
const { label, formatLabel, style } = outline;
const bill = "AN ACT RELATING TO THE INCOME TAX; AMENDING SECTION 63-3035, IDAHO CODE, TO REVISE THE DEADLINE FOR EMPLOYERS TO REPORT CERTAIN INFORMATION TO THE STATE TAX COMMISSION, TO PROVIDE A TIME PERIOD FOR EMPLOYERS TO CORRECT ANY ERRORS IN AN ELECTRONIC FILING AND TO MAKE TECHNICAL CORRECTIONS.</p><p>Be It Enacted by the Legislature of the State of Idaho:</p><p>SECTION 1. That Section 63-3035, Idaho Code, be, and the same is hereby amended to read as follows:</p><p>63-3035. STATE WITHHOLDING TAX ON PERCENTAGE BASIS &mdash; WITHHOLDING, COLLECTION AND PAYMENT OF TAX. (a) Every employer who is required under the provisions of the Internal Revenue Code to withhold, collect and pay income tax on wages or salaries paid by such employer to any employee (other than employees specified in Internal Revenue Code section 3401(a)(2)) shall, at the time of such payment of wages, salary, bonus or other emolument to such employee, deduct and retain therefrom an amount substantially equivalent to the tax reasonably calculated by the state tax commission to be due from the employee under this chapter. The state tax commission shall prepare tables showing amounts to be withheld, and shall supply same to each employer sub-ject to this section. In the event that an employer can demonstrate adminis-trative inconvenience in complying with the exact requirements set forth in these tables, he may, with the consent of the state tax commission and upon application to it, use a different method which will produce substantially the same amount of taxes withheld. Every employer making payments of wages or salaries earned in Idaho, regardless of the place where such payment is made: (1) Shall be liable to the state of Idaho for the payment of the tax re-quired to be deducted and withheld under this section and shall not be liable to any individual for the amount deducted from his wages and paid over in compliance or intended compliance with this section; (2) Must pay to the state tax commission monthly on or before the 20th twentieth day of the succeeding month, or at such other times as the state tax commission may allow, an amount of tax which, under the provi-sions of this chapter, he is required to deduct and withhold; (3) Shall register with the state tax commission, in the manner pre-scribed by it, to establish an employer's withholding account number. The account number will be used to report all amounts withheld, for the annual reconciliation required in this section, and for such other pur-poses relating to withholding as the state tax commission may require; and (4) Must, notwithstanding the provisions of paragraphs (1) and (2) of this subsection, if the amount of withholding of such employer for the preceding twelve (12) month period equals or exceeds two hundred forty thousand dollars ($240,000) per annum or an average of twenty thousand dollars ($20,000) per month per annum, pay to the state tax commission on the basis of two (2) withholding periods. The first of which shall begin on the first day of the month and end on the fifteenth day of the same month and payment shall be made not later than the twentieth day of the same month. The second period shall begin on the sixteenth day of the same month and end on the last day of the same month, and payment shall be made not later than the fifth day of the following month. (5) If a payment required pursuant to subsection (a) paragraph (2) or (a) (4) of this sub section is not made or is made delinquently or if made is not equal to the withholding required under this section, the state tax commission may treat the failure as a failure to file a return and may take administrative and judicial actions as authorized by this chapter in the case of a failure to file a return. Interest, at the rate provided by section 63-3045, Idaho Code, shall apply to any such under-payment. (6) Commencing in 2006, the state tax commission shall determine whether the threshold amounts established by subsection (a) paragraph (4) of this sub section must be adjusted to reflect fluctuations in the cost of living. The state tax commission shall base its determination on the cumulative effect of the annual cost-of-living percentage modi-fications determined by the United States secretary of health and human services pursuant to 42 U . S .  C  . 415(i). When the cumulative percentage applied to the monthly threshold amount equals or exceeds five thousand dollars ($5,000), the commission shall promulgate a rule adjusting the monthly threshold amount by five thousand dollars ($5,000) and making the necessary proportional adjustment to the annual threshold amount. The rule shall be effective for the next succeeding calendar year and each year thereafter until again adjusted by the commission. The tax commission shall determine subsequent adjustments in the same manner, in each case using the year of the last adjustment as the base year.\n(b) (1) In addition to the payments required pursuant to subsection s (a)(2) and (a) (4) of this section, every employer shall file a return upon such form as shall be prescribed by the state tax commission, but not more frequently than annually, or as required pursuant to any agree-ment between the state tax commission and the department of labor un-der section 63-3035B, Idaho Code, unless a shorter filing period and due date is prescribed by the state tax commission. The return shall be due on the last day of the second first month following the end of the period to which the return relates. The return shall: (i) Show, for the period to which it relates, the total amount of wages, salary, bonus or other emolument paid to his employees, the amount deducted therefrom in accordance with the provisions of the Internal Revenue Code, the amount deducted therefrom in accor-dance with the provisions of this section, the amount of any pre-vious payments made pursuant to this section, the amount of any deficiency due from the employer or refund payable by the state tax commission and such pertinent and necessary information as the state tax commission may require. (ii) Include a copy of the declaration of withholding provided to employees pursuant to subsection (b) paragraph (2) of this sub section. (2) Every employer making a declaration of withholding as provided herein shall furnish to the employees annually, but not later than thirty (30) days after the end of the calendar year, a record of the amount of tax withheld from such employee on forms to be prescribed, prepared and furnished by the state tax commission. (3) Every employer who is required, under Internal Revenue Code section 6011, to file returns on magnetic media, machine readable form or elec-tronic means, as defined in the Idaho uniform electronic transaction s act, may be required by rules of the state tax commission to file corre-sponding state returns on similar magnetic media, machine readable form or electronic means. Such rules may provide a different due date for such returns, which shall be no later than the date employers are re-quired to file such returns with the internal revenue service or the so-cial security administration and shall provide a five (5) business day period for an employer to correct errors in the electronic file received by the due date .\n(c) All moneys deducted and withheld by every employer shall immedi-ately upon such deduction be state money and every employer who deducts and retains any amount of money under the provisions of this chapter shall hold the same in trust for the state of Idaho and for the payment thereof to the state tax commission in the manner and at the times in this chapter provided. Any employer who does not possess real property situated within the state of Idaho, which, in the opinion of the state tax commission, is of sufficient value to cover his probable tax liability, may be required to post a surety bond in such sum as the state tax commission shall deem adequate to protect the state.\n (d) The provisions of this chapter relating to additions to tax in case of delinquency, and penalties, shall apply to employers subject to the pro-visions of this section and for these purposes any amount deducted, or re-quired to be deducted and remitted to the state tax commission under this section, shall be considered to be the tax of the employer and with respect to such amount he shall be considered the taxpayer.\n(e) Amounts deducted from wages of an employee during any calendar year in accordance with the provisions of this section shall be considered to be in part payment of the tax imposed on such employee for his tax year, which begins within such calendar year, and the return made by the employer under this subsection (e) shall be accepted by the state tax commission as evidence in favor of the employee of the amount so deducted from his wages. Where the total amount so deducted exceeds the amount of tax on the employee, based on his Idaho taxable income, or where his income is not taxable under this chap-ter, the state tax commission shall, after examining the annual return filed by the employee in accordance with this chapter, but not later than sixty (60) days after the filing of each return, refund the amount of the excess de-ducted.\n(f) This section shall in no way relieve any taxpayer from his obliga-tion of filing a return at the time required under this chapter, and, should the amount withheld under the provisions of this section be insufficient to pay the total tax of such taxpayer, such unpaid tax shall be paid at the time prescribed by section 63-3034, Idaho Code.\n(g) An employee receiving wages shall on any day be entitled to not more than, but may claim fewer than, the number of withholding exemptions to which he is entitled under the Internal Revenue Code for federal income tax with-holding purposes.\n(h) An employer shall use the exemption certificate filed by the em-ployee with the employer under the withholding exemption provisions of the Internal Revenue Code in determining the amount of tax to be withheld from the employee's wages or salary under this chapter. The state tax commission may redetermine the number of withholding exemptions to which an employee is entitled under subsection (g) of this section, and the state tax commission may require such exemption certificate to be filed on a form prescribed by the commission in any circumstance where the commission finds that the ex-emption certificate filed for Internal Revenue Code purposes does not prop-erly reflect the number of withholding exemptions to which the employee is entitled under this chapter. In no event shall any employee give an exemp-tion certificate which claims a higher number of withholding exemptions than the number to which the employee is entitled by subsection (g) of this section.";

describe('Bill Outline', ()=> {
	// build regex from outline styles and calibrate capture counts per outline label
	before(outline.build);
	
	it('gets label for outline index', ()=> {
		expect(label[style.ALPHA_LOWER].at(0)).equals('a');
		expect(label[style.ROMAN_UPPER].at(3)).equals('IV');
	});
	
	it('increments outline label', ()=> {
		expect(label[style.ALPHA_LOWER].after('a')).equals('b');
		expect(label[style.NUMBER].after(1)).equals(2);
		expect(label[style.NUMBER].after('5')).equals(6);
		expect(label[style.ROMAN_LOWER].after('ii')).equals('iii');
		expect(label[style.ROMAN_UPPER].after('III')).equals('IV');
	});

	it('styles label', ()=> {
		outline.config.format = '(%s)';
		expect(formatLabel('a')).equals('\\(a\\)');
		expect(formatLabel('b', false, false)).equals('(b)');
	});

	it('builds regular expression to match outline', ()=> {
		let valid = false;
		try {
			let re = label[style.ALPHA_LOWER].re;
			valid = (re != null && re.source.length > 0);
		} catch (e) {
			valid = false;
		}
		expect(valid).is.true;
	});

	it('calculates label pattern capture counts', ()=> {
		expect(outline.captures.firstLabelAt).equals(3);
		expect(outline.captures.perLabel).equals(4);
		expect(outline.captures.indexForLabel(1)).equals(3);
		expect(outline.captures.indexForLabel(3)).equals(11);
	});

	it('normalizes labels that contain a mix of insertions and deletions', ()=> {
		let source = '\n(1) One\n' +
			'<ins>(2)</ins> Two\n' +
			'(<del>2</del><ins>3</ins>) Three\n' +
			'(1<del>4</del><ins>5</ins>) Four\n' +
			'(<del>a</del><ins>b</ins>) Five';
		let target = '\n(1) One\n' +
			'<ins>(2)</ins> Two\n' +
			'<dfn>(3)</dfn> Three\n' +
			'<dfn>(15)</dfn> Four\n' +
			'<dfn>(b)</dfn> Five';

		expect(outline.normalizeLabels(source)).equals(target);
	});

	it('matches major outline in legislation', ()=> {
		let match = bill.match(label[style.ALPHA_LOWER].re);

		expect(match).is.not.null;
		expect(match).is.not.empty;
	});
	
	it('matches second and third level labels', ()=> {
		const section = '(1) In addition to the payments required pursuant to subsection s (a)(2) and (a) (4) of this section, every employer shall file a return upon such form as shall be prescribed by the state tax commission, but not more frequently than annually, or as required pursuant to any agree-ment between the state tax commission and the department of labor un-der section 63-3035B, Idaho Code, unless a shorter filing period and due date is prescribed by the state tax commission. The return shall be due on the last day of the second first month following the end of the period to which the return relates. The return shall:\n(i) Show, for the period to which it relates, the total amount of wages, salary, bonus or other emolument paid to his employees, the amount deducted therefrom in accordance with the provisions of the Internal Revenue Code, the amount deducted therefrom in accor-dance with the provisions of this section, the amount of any pre-vious payments made pursuant to this section, the amount of any deficiency due from the employer or refund payable by the state tax commission and such pertinent and necessary information as the state tax commission may require.\n(ii) Include a copy of the declaration of withholding provided to employees pursuant to subsection (b) paragraph (2) of this sub section.\n(2) <ins>Every</ins> employer making a declaration of withholding as provided herein shall furnish to the employees annually, but not later than thirty (30) days after the end of the calendar year, a record of the amount of tax withheld from such employee on forms to be prescribed, prepared and furnished by the state tax commission.\n<ins>(3)</ins> Every employer who is required, under Internal Revenue Code section 6011, to file returns on magnetic media, machine readable form or elec-tronic means, as defined in the Idaho uniform electronic transaction s act, may be required by rules of the state tax commission to file corre-sponding state returns on similar magnetic media, machine readable form or electronic means. Such rules may provide a different due date for such returns, which shall be no later than the date employers are re-quired to file such returns with the internal revenue service or the so-cial security administration and shall provide a five (5) business day period for an employer to correct errors in the electronic file received by the due date.'
		let match = section.match(label[style.NUMBER].re);

		expect(match).is.not.null;
		expect(match).is.not.empty;
		expect(match[outline.captures.indexForLabel(2)])
			.equals('<ins>Every</ins> employer making a declaration of withholding as provided herein shall furnish to the employees annually, but not later than thirty (30) days after the end of the calendar year, a record of the amount of tax withheld from such employee on forms to be prescribed, prepared and furnished by the state tax commission.');
	})
});