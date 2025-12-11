import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Loader2, Search, TriangleAlert } from 'lucide-react';
import axiosMethods from '../../../axiosConfig';

const OPPORTUNITY_STAGES = [
    'Prospecting',
    'Proposal Sent',
    'Negotiation',
    'Closed-Won',
    'Closed-Lost',
];

const ConvertLeadModal = ({
    leadData,
    leadId,
    onConvert,
    onCancel,
    isSubmitting = false,
    conversionError = '',
}) => {
    const [accountOption, setAccountOption] = useState('new');
    const [contactOption, setContactOption] = useState('new');
    const [opportunityOption, setOpportunityOption] = useState('new');
    const [skipOpportunity, setSkipOpportunity] = useState(false);

    const [accounts, setAccounts] = useState([]);
    const [accountsLoading, setAccountsLoading] = useState(false);
    const [accountsError, setAccountsError] = useState('');
    const [accountSearch, setAccountSearch] = useState('');
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [accountsLoaded, setAccountsLoaded] = useState(false);
    const accountsFetchInFlight = useRef(false);

    const initialAccountName = useMemo(() => {
        const fromCompany = String(leadData?.company ?? '').trim();
        if (fromCompany) {
            return fromCompany;
        }

        const fromLeadName = String(leadData?.name ?? '').trim();
        if (fromLeadName) {
            return fromLeadName;
        }

        return '';
    }, [leadData?.company, leadData?.name]);
    const originalAccountNameRef = useRef(initialAccountName);
    useEffect(() => {
        originalAccountNameRef.current = initialAccountName;
    }, [initialAccountName]);

    const [newAccountName, setNewAccountName] = useState(initialAccountName);
    useEffect(() => {
        setNewAccountName(initialAccountName);
    }, [initialAccountName]);

    const [contactName, setContactName] = useState(leadData?.name || '');
    const [contactEmail, setContactEmail] = useState(leadData?.email || '');
    const [contactPhone, setContactPhone] = useState(leadData?.phone || '');
    const [contactSearch, setContactSearch] = useState('');
    const [selectedContact, setSelectedContact] = useState(null);

    const defaultOpportunityTitle = leadData?.company
        ? `${leadData.company} Opportunity`
        : 'New Opportunity';
    const [opportunityName, setOpportunityName] = useState(defaultOpportunityTitle);
    const [opportunityAmount, setOpportunityAmount] = useState(
        leadData?.expected_deal_value ? String(leadData.expected_deal_value) : ''
    );
    const [opportunitySearch, setOpportunitySearch] = useState('');
    const [selectedOpportunity, setSelectedOpportunity] = useState(null);
    const [opportunityStage, setOpportunityStage] = useState(OPPORTUNITY_STAGES[0]);
    const [opportunityExpectedCloseDate, setOpportunityExpectedCloseDate] = useState(
        leadData?.expected_closing_date
            ? String(leadData.expected_closing_date).slice(0, 10)
            : ''
    );

    const [submitError, setSubmitError] = useState('');
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        if (
            accountOption !== 'existing' ||
            accountsLoaded ||
            accountsFetchInFlight.current
        ) {
            return;
        }

        let active = true;
        accountsFetchInFlight.current = true;

        const fetchAccounts = async () => {
            try {
                setAccountsLoading(true);
                setAccountsError('');
                const response = await axiosMethods.get('/getAccountsContactsOpportunity');
                if (!active) {
                    return;
                }
                const rawAccounts = response?.data || [];
                const normalizedAccounts = rawAccounts.map((account) => ({
                    ...account,
                    contacts: (account.contacts || []).map((contact) => ({
                        ...contact,
                        account_id:
                            contact.account_id ??
                            contact.accountId ??
                            account.id,
                    })),
                }));
                setAccounts(normalizedAccounts);
                setAccountsLoaded(true);
            } catch (error) {
                if (active) {
                    const message =
                        error?.response?.data?.message || 'Unable to load accounts.';
                    setAccountsError(message);
                    setAccountsLoaded(true);
                }
            } finally {
                if (active) {
                    setAccountsLoading(false);
                }
                accountsFetchInFlight.current = false;
            }
        };

        fetchAccounts();

        return () => {
            active = false;
        };
    }, [accountOption, accountsLoaded]);

    useEffect(() => {
        if (accountOption !== 'new') {
            return;
        }

        setSelectedAccount(null);
        setAccountSearch('');
        if (contactOption === 'existing') {
            setSelectedContact(null);
            setContactSearch('');
        }
        setSelectedOpportunity(null);
        setOpportunitySearch('');
        setAccountsLoading(false);
        accountsFetchInFlight.current = false;

        if (!skipOpportunity) {
            setOpportunityOption('new');
        }
    }, [accountOption, contactOption, skipOpportunity]);

    useEffect(() => {
        if (accountOption !== 'existing') {
            return;
        }

        setSelectedContact(null);
        setContactSearch('');
        setSelectedOpportunity(null);
        setOpportunitySearch('');
    }, [accountOption]);
    useEffect(() => {
        setSelectedContact(null);
        setContactSearch('');
        setSelectedOpportunity(null);
        setOpportunitySearch('');
    }, [selectedAccount]);

    useEffect(() => {
        if (
            opportunityOption === 'existing' &&
            selectedAccount &&
            !(selectedAccount.opportunities || []).length
        ) {
            setOpportunityOption(skipOpportunity ? 'none' : 'new');
        }
    }, [selectedAccount, opportunityOption, skipOpportunity]);

    useEffect(() => {
        if (conversionError && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        }
    }, [conversionError]);

    const filteredAccounts = useMemo(() => {
        const term = accountSearch.trim().toLowerCase();
        if (!term) {
            return accounts;
        }

        return accounts.filter((account) =>
            [account.name, account.company, account.industry]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(term))
        );
    }, [accounts, accountSearch]);

    const contactsForAccount = selectedAccount?.contacts || [];
    const filteredContacts = useMemo(() => {
        const term = contactSearch.trim().toLowerCase();
        if (!term) {
            return contactsForAccount;
        }

        return contactsForAccount.filter((contact) =>
            [contact.name, contact.email, contact.phone]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(term))
        );
    }, [contactsForAccount, contactSearch]);

    const contactParentMismatch = useMemo(() => {
        if (accountOption !== 'existing' || contactOption !== 'existing') {
            return false;
        }

        if (!selectedContact) {
            return false;
        }

        if (!selectedAccount) {
            return true;
        }

        const contactAccountId =
            selectedContact.account_id ??
            selectedContact.accountId ??
            selectedContact.account?.id ??
            null;

        if (contactAccountId == null) {
            return false;
        }

        return contactAccountId !== selectedAccount.id;
    }, [accountOption, contactOption, selectedAccount, selectedContact]);

    useEffect(() => {
        if (
            submitError === 'Contact must be parented by account' &&
            !contactParentMismatch
        ) {
            setSubmitError('');
        }
    }, [contactParentMismatch, submitError]);

    const opportunitiesForAccount = selectedAccount?.opportunities || [];
    const filteredOpportunities = useMemo(() => {
        const term = opportunitySearch.trim().toLowerCase();
        if (!term) {
            return opportunitiesForAccount;
        }

        return opportunitiesForAccount.filter((opportunity) =>
            [opportunity.title, opportunity.stage]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(term))
        );
    }, [opportunitiesForAccount, opportunitySearch]);

    const handleAccountSearchChange = (event) => {
        const value = event.target.value;
        setAccountSearch(value);

        const match = accounts.find(
            (account) =>
                account.name &&
                account.name.toLowerCase() === value.trim().toLowerCase()
        );

        if (match) {
            setSelectedAccount(match);
        } else {
            setSelectedAccount(null);
        }
    };

    const handleContactSearchChange = (event) => {
        const value = event.target.value;
        setContactSearch(value);

        const match = contactsForAccount.find(
            (contact) =>
                contact.name &&
                contact.name.toLowerCase() === value.trim().toLowerCase()
        );

        if (match) {
            setSelectedContact(match);
        } else {
            setSelectedContact(null);
        }
    };

    const handleOpportunitySearchChange = (event) => {
        const value = event.target.value;
        setOpportunitySearch(value);

        const match = opportunitiesForAccount.find(
            (opportunity) =>
                opportunity.title &&
                opportunity.title.toLowerCase() === value.trim().toLowerCase()
        );

        if (match) {
            setSelectedOpportunity(match);
        } else {
            setSelectedOpportunity(null);
        }
    };

    const selectAccount = (account) => {
        setSelectedAccount(account);
        setAccountSearch(account.name || '');
    };

    const selectContact = (contact) => {
        setSelectedContact(contact);
        setContactSearch(contact.name || '');
    };

    const selectOpportunity = (opportunity) => {
        setSelectedOpportunity(opportunity);
        setOpportunitySearch(opportunity.title || '');
    };

    const handleSubmit = () => {
        const leadIdentifier = leadId || leadData?.id;
        if (!leadIdentifier) {
            setSubmitError('Lead identifier is missing.');
            return;
        }

        if (accountOption === 'new') {
            if (!newAccountName.trim()) {
                setSubmitError('Account name is required.');
                return;
            }
        } else if (!selectedAccount) {
            setSubmitError('Select an existing account.');
            return;
        }

        if (contactOption === 'new') {
            if (!contactName.trim()) {
                setSubmitError('Contact name is required.');
                return;
            }
        } else if (!selectedContact) {
            setSubmitError('Select an existing contact.');
            return;
        }

        if (
            accountOption === 'existing' &&
            contactOption === 'existing' &&
            selectedContact
        ) {
            const contactAccountId =
                selectedContact.account_id ??
                selectedContact.accountId ??
                selectedContact.account?.id ??
                null;

            if (!selectedAccount || contactAccountId !== selectedAccount.id) {
                setSubmitError('Contact must be parented by account');
                return;
            }
        }

        if (opportunityOption === 'existing' && !selectedOpportunity) {
            setSubmitError('Select an existing opportunity.');
            return;
        }

        const payload = {
            lead_id: leadIdentifier,
            status: 'converted',
        };

        if (accountOption === 'new') {
            const trimmedCompanyName = newAccountName.trim();
            const trimmedAccountName =
                originalAccountNameRef.current?.trim() || trimmedCompanyName;
            payload.account = {
                mode: 'new',
                name: trimmedAccountName,
                company: trimmedCompanyName,
            };
        } else {
            payload.account = {
                mode: 'existing',
                account_id: selectedAccount.id,
            };
        }

        if (contactOption === 'new') {
            const newContact = {
                mode: 'new',
                name: contactName.trim(),
            };

            if (contactEmail.trim()) {
                newContact.email = contactEmail.trim();
            }

            if (contactPhone.trim()) {
                newContact.phone = contactPhone.trim();
            }

            payload.contact = newContact;
        } else {
            payload.contact = {
                mode: 'existing',
                contact_id: selectedContact.id,
            };
        }

        if (opportunityOption === 'new') {
            const amount = opportunityAmount.trim()
                ? Number(opportunityAmount)
                : 0;
            const hasResponseScore =
                leadData?.response_score !== undefined &&
                leadData?.response_score !== null &&
                leadData?.response_score !== '';
            const parsedResponseScore = hasResponseScore
                ? Number(leadData.response_score)
                : null;

            payload.opportunity = {
                mode: 'new',
                title:
                    opportunityName.trim() ||
                    `${selectedAccount?.company || newAccountName || 'New'} Opportunity`,
                amount: Number.isNaN(amount) ? 0 : amount,
                stage: opportunityStage,
                expected_close_date: opportunityExpectedCloseDate || null,
                response_score:
                    parsedResponseScore !== null && !Number.isNaN(parsedResponseScore)
                        ? parsedResponseScore
                        : null,
            };
        } else if (opportunityOption === 'existing') {
            payload.opportunity = {
                mode: 'existing',
                opportunity_id: selectedOpportunity.id,
            };
        } else {
            payload.opportunity = {
                mode: 'none',
            };
        }

        setSubmitError('');
        onConvert(payload);
    };

    return (
        <div className="fixed inset-0 z-50 flex backdrop-blur-sm items-center justify-center bg-black/30 p-4">
            <div
                ref={scrollContainerRef}
                className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-md border border-gray-300 bg-white shadow-xl"
            >
                <div className="border-b border-gray-200 py-2">
                    <div className="flex items-center px-6">
                        <div className="flex-1 text-left">
                            {conversionError ? (
                                <span className="text-sm text-red-600 flex">{conversionError} <TriangleAlert size={15} className='ml-2 mt-0.5' /></span>
                            ) : null}
                        </div>
                        <h2 className="flex-shrink-0 text-center text-xl font-semibold text-gray-900">
                            Convert Lead
                        </h2>
                        <div className="flex-1" />
                    </div>
                </div>

                <div className="space-y-8 p-6">
                    <div className="border-b border-gray-200 pb-6">
                        <div className="flex items-start gap-4">
                            <ArrowRight className="mt-1 h-4 w-4 text-gray-900" />
                            <div className="min-w-20 text-sm font-semibold text-gray-900">
                                Account
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                                    <div className="flex-1">
                                        <label className="mb-3 flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="account"
                                                className="h-4 w-4 accent-gray-900"
                                                checked={accountOption === 'new'}
                                                onChange={() => setAccountOption('new')}
                                            />
                                            <span className="text-sm font-semibold">
                                                Create New
                                            </span>
                                        </label>
                                        <label className="block text-xs text-gray-700">
                                            * Account Name
                                        </label>
                                        <input
                                            type="text"
                                            value={newAccountName}
                                            onChange={(event) =>
                                                setNewAccountName(event.target.value)
                                            }
                                            disabled={accountOption !== 'new'}
                                            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                                            placeholder="Enter account name"
                                        />
                                    </div>

                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="h-16 w-px bg-gray-300" />
                                        <span className="text-sm text-gray-500">- OR -</span>
                                        <div className="h-16 w-px bg-gray-300" />
                                    </div>

                                    <div className="flex-1">
                                        <label className="mb-3 flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="account"
                                                className="h-4 w-4 accent-gray-900"
                                                checked={accountOption === 'existing'}
                                                onChange={() => setAccountOption('existing')}
                                            />
                                            <span className="text-sm font-semibold">
                                                Choose Existing
                                            </span>
                                        </label>

                                        {accountOption === 'existing' && (
                                            <div className="space-y-3 rounded border border-gray-200 bg-gray-50 p-3">
                                                <div>
                                                    <label className="mb-2 block text-xs text-gray-700">
                                                        Account Search
                                                    </label>
                                                    <div className="relative">
                                                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            value={accountSearch}
                                                            onChange={handleAccountSearchChange}
                                                            placeholder="Start typing account name"
                                                            className="w-full rounded border border-gray-300 px-9 py-2 text-sm focus:outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="max-h-40 overflow-y-auto rounded border border-gray-200 bg-white">
                                                    {accountsLoading ? (
                                                        <div className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-gray-500">
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            Loading accounts...
                                                        </div>
                                                    ) : filteredAccounts.length ? (
                                                        filteredAccounts.map((account) => (
                                                            <button
                                                                type="button"
                                                                key={account.id}
                                                                onClick={() => selectAccount(account)}
                                                                className={`w-full px-3 py-2 text-left text-sm transition ${selectedAccount?.id === account.id
                                                                    ? 'bg-black text-white'
                                                                    : 'hover:bg-gray-100'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-medium">
                                                                        {account.name}
                                                                    </span>
                                                                    <span className="text-xs text-gray-600">
                                                                        {account.company || '—'}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-gray-500">
                                                                    {account.industry || 'Industry not set'}
                                                                </p>
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="px-3 py-2 text-xs text-gray-500">
                                                            No account matches found.
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="text-xs text-gray-600">
                                                    {filteredAccounts.length} account match
                                                    {filteredAccounts.length === 1 ? '' : 'es'} found
                                                </p>

                                                {accountsError && (
                                                    <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                                                        {accountsError}
                                                    </p>
                                                )}

                                                {selectedAccount && (
                                                    <div className="rounded border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700">
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {selectedAccount.name}
                                                        </div>
                                                        <p>
                                                            Company: {selectedAccount.company || 'Not set'}
                                                        </p>
                                                        <p>
                                                            Industry: {selectedAccount.industry || 'Not set'}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="border-b border-gray-200 pb-6">
                        <div className="flex items-start gap-4">
                            <ArrowRight className="mt-1 h-4 w-4 text-gray-900" />
                            <div className="min-w-20 text-sm font-semibold text-gray-900">
                                Contact
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                                    <div className="flex-1">
                                        <label className="mb-3 flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="contact"
                                                className="h-4 w-4 accent-gray-900"
                                                checked={contactOption === 'new'}
                                                onChange={() => setContactOption('new')}
                                            />
                                            <span className="text-sm font-semibold">
                                                Create New
                                            </span>
                                        </label>

                                        <div className="space-y-3 rounded border border-gray-200 bg-white p-3">
                                            <div>
                                                <label className="text-xs text-gray-700">
                                                    * Contact Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={contactName}
                                                    onChange={(event) =>
                                                        setContactName(event.target.value)
                                                    }
                                                    disabled={contactOption !== 'new'}
                                                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                                                    placeholder="Enter contact name"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-700">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    value={contactEmail}
                                                    onChange={(event) =>
                                                        setContactEmail(event.target.value)
                                                    }
                                                    disabled={contactOption !== 'new'}
                                                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                                                    placeholder="email@example.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-700">
                                                    Phone
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={contactPhone}
                                                    onChange={(event) =>
                                                        setContactPhone(event.target.value)
                                                    }
                                                    disabled={contactOption !== 'new'}
                                                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                                                    placeholder="+92 300 0000000"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="h-10 w-px bg-gray-300" />
                                        <span className="text-sm text-gray-500">- OR -</span>
                                        <div className="h-10 w-px bg-gray-300" />
                                    </div>

                                    <div className="flex-1">
                                        <label className="mb-3 flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="contact"
                                                className="h-4 w-4 accent-gray-900"
                                                checked={contactOption === 'existing'}
                                                onChange={() => setContactOption('existing')}
                                            />
                                            <span className="text-sm font-semibold">
                                                Choose Existing
                                            </span>
                                        </label>

                                        {contactOption === 'existing' && (
                                            <div className="space-y-3 rounded border border-gray-200 bg-gray-50 p-3">
                                                {selectedAccount ? (
                                                    <>
                                                        <div>
                                                            <label className="mb-2 block text-xs text-gray-700">
                                                                Contact Search
                                                            </label>
                                                            <div className="relative">
                                                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                                                <input
                                                                    type="text"
                                                                    value={contactSearch}
                                                                    onChange={handleContactSearchChange}
                                                                    placeholder="Search contacts"
                                                                    className={`w-full rounded border px-9 py-2 text-sm focus:outline-none ${contactParentMismatch
                                                                        ? 'border-red-500 focus:border-red-500'
                                                                        : 'border-gray-300 focus:border-gray-900'
                                                                        }`}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div
                                                            className={`max-h-40 overflow-y-auto rounded border bg-white ${contactParentMismatch
                                                                ? 'border-red-500'
                                                                : 'border-gray-200'
                                                                }`}
                                                        >
                                                            {filteredContacts.length ? (
                                                                filteredContacts.map((contact) => (
                                                                    <button
                                                                        type="button"
                                                                        key={contact.id}
                                                                        onClick={() => selectContact(contact)}
                                                                        className={`w-full px-3 py-2 text-left text-sm transition ${selectedContact?.id === contact.id
                                                                            ? 'bg-black text-white'
                                                                            : 'hover:bg-gray-100'
                                                                            }`}
                                                                    >
                                                                        <div className="font-medium">
                                                                            {contact.name}
                                                                        </div>
                                                                        <p className="text-xs text-gray-500">
                                                                            {(contact.email || 'No email') +
                                                                                ' · ' +
                                                                                (contact.phone || 'No phone')}
                                                                        </p>
                                                                    </button>
                                                                ))
                                                            ) : (
                                                                <div className="px-3 py-2 text-xs text-gray-500">
                                                                    0 contact matches detected.
                                                                </div>
                                                            )}
                                                        </div>

                                                        {contactParentMismatch && (
                                                            <p className="text-xs text-red-600">
                                                                Contact must be parented by account
                                                            </p>
                                                        )}

                                                        <p className="text-xs text-gray-600">
                                                            {filteredContacts.length} contact match
                                                            {filteredContacts.length === 1 ? '' : 'es'} found
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="text-xs text-gray-600">
                                                        Choose an account first to view linked contacts.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-start gap-4">
                            <ArrowRight className="mt-1 h-4 w-4 text-gray-900" />
                            <div className="min-w-20 text-sm font-semibold text-gray-900">
                                Opportunity
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                                    <div className="flex-1">
                                        <label className="mb-3 flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="opportunity"
                                                className="h-4 w-4 accent-gray-900"
                                                checked={opportunityOption === 'new'}
                                                onChange={() => {
                                                    setOpportunityOption('new');
                                                    setSkipOpportunity(false);
                                                }}
                                                disabled={skipOpportunity}
                                            />
                                            <span className="text-sm font-semibold">
                                                Create New
                                            </span>
                                        </label>

                                        <div className="space-y-3 rounded border border-gray-200 bg-white p-3">
                                            <div>
                                                <label className="text-xs text-gray-700">
                                                    Opportunity Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={opportunityName}
                                                    onChange={(event) =>
                                                        setOpportunityName(event.target.value)
                                                    }
                                                    disabled={
                                                        opportunityOption !== 'new' || skipOpportunity
                                                    }
                                                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                                                    placeholder="Opportunity title"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-700">
                                                    Amount
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={opportunityAmount}
                                                    onChange={(event) =>
                                                        setOpportunityAmount(event.target.value)
                                                    }
                                                    disabled={
                                                        opportunityOption !== 'new' || skipOpportunity
                                                    }
                                                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-700">
                                                    Stage
                                                </label>
                                                <select
                                                    value={opportunityStage}
                                                    onChange={(event) =>
                                                        setOpportunityStage(event.target.value)
                                                    }
                                                    disabled={
                                                        opportunityOption !== 'new' || skipOpportunity
                                                    }
                                                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                                                >
                                                    {OPPORTUNITY_STAGES.map((stage) => (
                                                        <option key={stage} value={stage}>
                                                            {stage}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-700">
                                                    Expected Close Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={opportunityExpectedCloseDate}
                                                    onChange={(event) =>
                                                        setOpportunityExpectedCloseDate(
                                                            event.target.value
                                                        )
                                                    }
                                                    disabled={
                                                        opportunityOption !== 'new' || skipOpportunity
                                                    }
                                                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                                                />
                                            </div>
                                            <label className="flex items-center gap-2 text-xs text-gray-700">
                                                <input
                                                    type="checkbox"
                                                    className="h-3.5 w-3.5"
                                                    checked={skipOpportunity}
                                                    onChange={(event) => {
                                                        const { checked } = event.target;
                                                        setSkipOpportunity(checked);
                                                        if (checked) {
                                                            setOpportunityOption('none');
                                                            setSelectedOpportunity(null);
                                                            setOpportunitySearch('');
                                                        } else {
                                                            setOpportunityOption('new');
                                                        }
                                                    }}
                                                />
                                                Don't create an opportunity upon conversion
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="h-8 w-px bg-gray-300" />
                                        <span className="text-sm text-gray-500">- OR -</span>
                                        <div className="h-12 w-px bg-gray-300" />
                                    </div>

                                    <div className="flex-1">
                                        <label className="mb-3 flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="opportunity"
                                                className="h-4 w-4 accent-gray-900"
                                                checked={opportunityOption === 'existing'}
                                                onChange={() => {
                                                    setOpportunityOption('existing');
                                                    setSkipOpportunity(false);
                                                }}
                                                disabled={
                                                    accountOption !== 'existing' ||
                                                    !selectedAccount ||
                                                    !(selectedAccount.opportunities || []).length
                                                }
                                            />
                                            <span className="text-sm font-semibold">
                                                Choose Existing
                                            </span>
                                        </label>

                                        {accountOption === 'existing' &&
                                            selectedAccount &&
                                            !(selectedAccount.opportunities || []).length && (
                                                <p className="mb-3 text-xs text-gray-600">
                                                    No opportunities exist for this account. Please create
                                                    a new one instead.
                                                </p>
                                            )}

                                        {opportunityOption === 'existing' && (
                                            <div className="space-y-3 rounded border border-gray-200 bg-gray-50 p-3">
                                                {selectedAccount ? (
                                                    (selectedAccount.opportunities || []).length ? (
                                                        <>
                                                            <div>
                                                                <label className="mb-2 block text-xs text-gray-700">
                                                                    Opportunity Search
                                                                </label>
                                                                <div className="relative">
                                                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                                                    <input
                                                                        type="text"
                                                                        value={opportunitySearch}
                                                                        onChange={
                                                                            handleOpportunitySearchChange
                                                                        }
                                                                        placeholder="Search opportunities"
                                                                        className="w-full rounded border border-gray-300 px-9 py-2 text-sm focus:outline-none"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="max-h-40 overflow-y-auto rounded border border-gray-200 bg-white">
                                                                {filteredOpportunities.length ? (
                                                                    filteredOpportunities.map(
                                                                        (opportunity) => (
                                                                            <button
                                                                                type="button"
                                                                                key={opportunity.id}
                                                                                onClick={() =>
                                                                                    selectOpportunity(
                                                                                        opportunity
                                                                                    )
                                                                                }
                                                                                className={`w-full px-3 py-2 text-left text-sm transition ${selectedOpportunity?.id ===
                                                                                    opportunity.id
                                                                                    ? 'bg-black text-white'
                                                                                    : 'hover:bg-gray-100'
                                                                                    }`}
                                                                            >
                                                                                <div className="font-medium">
                                                                                    {opportunity.title}
                                                                                </div>
                                                                                <p className="text-xs text-gray-500">
                                                                                    {opportunity.stage ||
                                                                                        'Stage not set'}
                                                                                </p>
                                                                            </button>
                                                                        )
                                                                    )
                                                                ) : (
                                                                    <div className="px-3 py-2 text-xs text-gray-500">
                                                                        No opportunity matches found.
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <p className="text-xs text-gray-600">
                                                                {filteredOpportunities.length}{' '}
                                                                opportunity match
                                                                {filteredOpportunities.length === 1
                                                                    ? ''
                                                                    : 'es'}{' '}
                                                                found
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <p className="text-xs text-gray-600">
                                                            No opportunities exist for this account. Please
                                                            create a new one instead.
                                                        </p>
                                                    )
                                                ) : (
                                                    <p className="text-xs text-gray-600">
                                                        Choose an account to view linked opportunities.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
                    {submitError && (
                        <p className="mr-auto text-sm text-red-600">{submitError}</p>
                    )}
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded cursor-pointer border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex cursor-pointer items-center gap-2 rounded bg-gray-950 px-6 py-2 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        Convert
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConvertLeadModal;