import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  VStack,
} from "@chakra-ui/react";
import { FunctionComponent } from "react";
import { ListFacet } from "ordercloud-javascript-sdk";
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
    <Box>
      {facets && (
        <Accordion defaultIndex={facets?.map((_f, idx) => idx)} allowMultiple>
          {facets?.map((f: ListFacet) => {
            return (
              <>
                <AccordionItem key={f.Name}>
                  <h2>
                    <AccordionButton>
                      <Box as="span" flex="1" textAlign="left">
                        {f.Name}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <VStack alignItems={"left"}>
                      <FacetListValue facetList={f} onChange={onChange} />
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              </>
            );
          })}
        </Accordion>
      )}
    </Box>
  );
};

export default FacetList;
