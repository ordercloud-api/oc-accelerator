import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Heading,
  VStack
} from "@chakra-ui/react";
import { ListFacet } from "ordercloud-javascript-sdk";
import { FunctionComponent } from "react";
import FacetListValue from "./FacetListValues";

interface FacetListProps {
  facets: ListFacet[] | undefined;
  onChange: (
    queryKey: string,
    resetPage?: boolean,
    index?: number
  ) => (value?: string | boolean | number) => void;
}

const FacetList: FunctionComponent<FacetListProps> = ({ facets, onChange }) => {

  return (
    <>
      {facets && (
        <Accordion
          defaultIndex={facets?.slice(0, 4).map((_f, idx) => idx)}
          allowMultiple
        >
          {facets?.map((f: ListFacet) => {
            return (
              <AccordionItem border="none" key={f.Name} w="full">
                  <AccordionButton>
                    <Heading as="h3" size="sm" flex="1" textAlign="left"
                    >
                      {f.Name}
                    </Heading>
                    <AccordionIcon />
                  </AccordionButton>
                <AccordionPanel as={VStack} alignItems="stretch">
                    <FacetListValue facetList={f} onChange={onChange} />
                </AccordionPanel>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </>
  );
};

export default FacetList;
