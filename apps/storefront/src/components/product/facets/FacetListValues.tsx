import {
  Checkbox,
} from "@chakra-ui/react";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { ListFacet, ListFacetValue } from "ordercloud-javascript-sdk";
import { useSearchParams } from "react-router-dom";

interface FacetListValuesProps {
  facetList: ListFacet | undefined;
  onChange: (
    queryKey: string,
    resetPage?: boolean,
    index?: number
  ) => (value?: string | boolean | number) => void;
}

const FacetListValues: FunctionComponent<FacetListValuesProps> = ({
  facetList,
  onChange,
}) => {
  const [searchParams] = useSearchParams();
  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);

  const getCheckedState = useCallback(() => {
    const facetValue = searchParams.getAll(`xp.${facetList?.XpPath}`);
    const checkedState =
      facetList?.Values?.map((v: ListFacetValue) => {
        return !!v?.Value && facetValue.includes(v.Value);
      }) || [];
    setCheckedItems(checkedState);
  }, [facetList?.Values, facetList?.XpPath, searchParams]);

  useEffect(() => getCheckedState(), [getCheckedState, searchParams]);

  return (
    <>
      {facetList?.Values?.map((v: ListFacetValue, idx: number) => (
        <Checkbox
          key={v.Value}
          isChecked={checkedItems[idx]}
          onChange={() => onChange(`xp.${facetList.XpPath}`, true)(v.Value)}
        >
          {v.Value} ({v?.Count})
        </Checkbox>
      ))}
    </>
  );
};

export default FacetListValues;
