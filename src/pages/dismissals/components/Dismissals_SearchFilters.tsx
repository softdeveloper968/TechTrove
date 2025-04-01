import React from "react";
import { ChangeEvent, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useDissmissalsContext } from "../DismissalsContext";
import { ISelectOptions } from "interfaces/late-notices.interface";
import DropdownPresentation from "components/common/dropdown/DropDown";
import ClearFilters from "components/common/button/ClearFilters";
import { CountyLists } from "utils/constants";

const initialSelectOption: ISelectOptions = { id: '', value: '' };

type Dismissals_SearchFiltersProps = {
    activeTab?: string;
};

const Dismissals_SearchFilters = (props: Dismissals_SearchFiltersProps) => {
    const [selectedCounty, setSelectedCounty] = useState<ISelectOptions>(initialSelectOption);

    // Get necessary functions from the context
    const { setAllUnsignedDismissals, getAllDismissals } = useDissmissalsContext();

    const handleCountyChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const county = event.target.value as string;
        setSelectedCounty({ id: county, value: county });
        // getAllDismissals(1, 100, props.activeTab === "Unsigned" ? false : true, '', county);
        getAllDismissals(1, 100, props.activeTab === "Ready to Sign" ? false : true, '', county);
        setAllUnsignedDismissals((prevDismissals) => ({ ...prevDismissals, searchParam: '' }));
    };

    const clearSearchFilters = () => {
        setSelectedCounty(initialSelectOption);
        // getAllDismissals(1, 100, props.activeTab === "Unsigned" ? false : true, '', '');
        getAllDismissals(1, 100, props.activeTab === "Ready to Sign" ? false : true, '', '');

        setAllUnsignedDismissals((prevDismissals) => ({ ...prevDismissals, searchParam: '' }));
    }

    return (
        <div className="flex items-center filterSec w-full mt-1">
            <DropdownPresentation
                heading={""}
                selectedOption={selectedCounty}
                handleSelect={(event) => handleCountyChange(event)}
                options={CountyLists}
                placeholder="Filter by county"
            />
            <ClearFilters
                type="button"
                isRounded={false}
                title="Clear Filters"
                handleClick={clearSearchFilters}
                icon={<FaTimes />}
            />
        </div>
    );
};

export default Dismissals_SearchFilters;
