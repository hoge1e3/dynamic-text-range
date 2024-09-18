# dynamic-text-rage

Library for replacing string buffer with multiple ranges. The content string of each range can be replaced and if the length of the content is changed, the index of other ranges are automatically adjusted.

# Classes

## Buffer

- new Buffer(text:string)
   - Creates buffer with text.
- buffer.addRange(start:number, end:number):Range
   - Creates and adds Range with specifined index.
   - The range can be overlapped with existing Ranges, but they should have relations of supersets or subsets. (For example, two range with 0...10 and 5...15 have a overlap but have neigther superset nor subset relations. They should NOT be present.)

## Range
- toString()
   - returns the content string
- replace(to:string)
   - Replace content string of this Range with `to`
   - If length of `to` is changed from current content string, the index(start and end) of other Range belonging to same buffer will be adjusted.
