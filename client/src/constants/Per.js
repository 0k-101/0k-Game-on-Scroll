class Per {
    constructor(isColorPer, perLength , perTotalValue, perCardIds, okeys = null) {
        this.isColorPer = isColorPer;
        if (okeys != null ){
            if ( okeys.length === 1) {
                // okeys = [ ['okey value','okey color'],['okey value','okey color'] ]
            }
            else if (okeys.length === 2) {
                
            }
        }
        this.perTotalValue = perTotalValue;
        this.perCardIds = perCardIds;
        this.perLength = perLength;
    }
}
export default Per;